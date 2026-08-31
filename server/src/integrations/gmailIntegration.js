const { google } = require('googleapis');
const BaseIntegration = require('./baseIntegration');
const config = require('../config/env');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

class GmailIntegration extends BaseIntegration {
  constructor(authCredentials = null) {
    super();
    this.clientId = config.GOOGLE_CLIENT_ID;
    this.clientSecret = config.GOOGLE_CLIENT_SECRET;
    this.redirectUri = config.GOOGLE_REDIRECT_URI;

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    if (authCredentials) {
      this.oauth2Client.setCredentials({
        access_token: authCredentials.accessToken,
        refresh_token: authCredentials.refreshToken,
        expiry_date: authCredentials.expiryDate
      });
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
    }
  }

  getAuthorizationUrl(state = null) {
    if (!this.clientId || !this.clientSecret) {
      const err = new Error('Google OAuth credentials not configured on server (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)');
      err.code = 'OAUTH_NOT_CONFIGURED';
      err.statusCode = 500;
      throw err;
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      ...(state ? { state: String(state) } : {})
    });
  }

  async handleOAuthCallback(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    // Get user profile email
    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const userinfo = await oauth2.userinfo.get();

    return {
      tokens,
      email: userinfo.data.email,
      name: userinfo.data.name
    };
  }

  // Parse header helper
  getHeader(headers, name) {
    const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
    return header ? header.value : '';
  }

  // Decode base64url encoded string
  decodeBase64(data) {
    if (!data) return '';
    try {
      const buff = Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
      return buff.toString('utf8');
    } catch {
      return '';
    }
  }

  // Extract body and attachments from Gmail payload parts
  parseMessageParts(payload) {
    let text = '';
    let html = '';
    const attachments = [];

    const processPart = (part) => {
      const mimeType = part.mimeType || '';
      const filename = part.filename || '';

      if (filename && filename.length > 0) {
        attachments.push({
          id: part.body?.attachmentId || part.partId,
          filename: filename,
          mimeType: mimeType,
          size: part.body?.size || 0
        });
      }

      if (mimeType === 'text/plain' && part.body?.data) {
        text += this.decodeBase64(part.body.data);
      } else if (mimeType === 'text/html' && part.body?.data) {
        html += this.decodeBase64(part.body.data);
      }

      if (part.parts && Array.isArray(part.parts)) {
        part.parts.forEach(processPart);
      }
    };

    if (payload) {
      if (payload.body?.data) {
        if (payload.mimeType === 'text/html') {
          html = this.decodeBase64(payload.body.data);
        } else {
          text = this.decodeBase64(payload.body.data);
        }
      }
      if (payload.parts) {
        payload.parts.forEach(processPart);
      }
    }

    return {
      text: text.trim(),
      html: html.trim() || text.trim(),
      attachments
    };
  }

  formatMessage(msg) {
    const headers = msg.payload?.headers || [];
    const from = this.getHeader(headers, 'From');
    const to = this.getHeader(headers, 'To');
    const cc = this.getHeader(headers, 'Cc');
    const bcc = this.getHeader(headers, 'Bcc');
    const subject = this.getHeader(headers, 'Subject') || '(No Subject)';
    const date = this.getHeader(headers, 'Date') || new Date(parseInt(msg.internalDate || Date.now(), 10)).toISOString();
    const messageIdHeader = this.getHeader(headers, 'Message-ID');

    const labelIds = msg.labelIds || [];
    const isUnread = labelIds.includes('UNREAD');
    const isStarred = labelIds.includes('STARRED');
    const isDraft = labelIds.includes('DRAFT');
    const isTrash = labelIds.includes('TRASH');

    const { text, html, attachments } = this.parseMessageParts(msg.payload);

    return {
      id: msg.id,
      threadId: msg.threadId,
      snippet: msg.snippet || text.substring(0, 120),
      from,
      to,
      cc,
      bcc,
      subject,
      date,
      internalDate: msg.internalDate,
      labels: labelIds,
      isUnread,
      isStarred,
      isDraft,
      isTrash,
      hasAttachments: attachments.length > 0,
      attachments,
      bodyText: text,
      bodyHtml: html,
      messageIdHeader
    };
  }

  async getMessages(options = {}) {
    if (!this.gmail) {
      throw new Error('Gmail client is not authenticated');
    }

    const { folder = 'INBOX', q = '', maxResults = 25, pageToken = null } = options;

    let query = q;
    const labelIds = [];

    if (folder === 'INBOX') labelIds.push('INBOX');
    else if (folder === 'STARRED') labelIds.push('STARRED');
    else if (folder === 'SENT') labelIds.push('SENT');
    else if (folder === 'DRAFT') labelIds.push('DRAFT');
    else if (folder === 'TRASH') labelIds.push('TRASH');
    else if (folder === 'IMPORTANT') labelIds.push('IMPORTANT');
    else if (folder === 'ARCHIVE') {
      query = (query ? query + ' ' : '') + '-in:inbox -in:trash -in:draft';
    }

    const listRes = await this.gmail.users.messages.list({
      userId: 'me',
      q: query || undefined,
      labelIds: labelIds.length ? labelIds : undefined,
      maxResults,
      pageToken: pageToken || undefined
    });

    const messages = [];
    if (listRes.data.messages && listRes.data.messages.length > 0) {
      // Fetch details in batch/parallel
      const detailPromises = listRes.data.messages.map(m =>
        this.gmail.users.messages.get({
          userId: 'me',
          id: m.id,
          format: 'full'
        }).catch(err => {
          console.warn(`Failed to fetch message ${m.id}:`, err.message);
          return null;
        })
      );

      const details = await Promise.all(detailPromises);
      for (const d of details) {
        if (d && d.data) {
          messages.push(this.formatMessage(d.data));
        }
      }
    }

    return {
      messages,
      nextPageToken: listRes.data.nextPageToken || null,
      resultSizeEstimate: listRes.data.resultSizeEstimate || messages.length
    };
  }

  async getMessage(messageId) {
    if (!this.gmail) throw new Error('Gmail client is not authenticated');

    const res = await this.gmail.users.messages.get({
      userId: 'me',
      id: messageId,
      format: 'full'
    });

    return this.formatMessage(res.data);
  }

  async getThread(threadId) {
    if (!this.gmail) throw new Error('Gmail client is not authenticated');

    const res = await this.gmail.users.threads.get({
      userId: 'me',
      id: threadId,
      format: 'full'
    });

    const rawMessages = res.data.messages || [];
    const messages = rawMessages.map(m => this.formatMessage(m));

    // Sort by internal date ascending
    messages.sort((a, b) => parseInt(a.internalDate || 0, 10) - parseInt(b.internalDate || 0, 10));

    const subject = messages.length > 0 ? messages[0].subject : '(No Subject)';
    const participants = Array.from(new Set(messages.map(m => m.from).filter(Boolean)));

    return {
      id: res.data.id,
      historyId: res.data.historyId,
      subject,
      participants,
      messageCount: messages.length,
      messages
    };
  }

  async searchMessages(query, options = {}) {
    return this.getMessages({ ...options, q: query, folder: '' });
  }

  async modifyMessage(messageId, { addLabelIds = [], removeLabelIds = [] }) {
    if (!this.gmail) throw new Error('Gmail client is not authenticated');

    const res = await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds,
        removeLabelIds
      }
    });

    return res.data;
  }

  async modifyThread(threadId, { addLabelIds = [], removeLabelIds = [] }) {
    if (!this.gmail) throw new Error('Gmail client is not authenticated');

    const res = await this.gmail.users.threads.modify({
      userId: 'me',
      id: threadId,
      requestBody: {
        addLabelIds,
        removeLabelIds
      }
    });

    return res.data;
  }

  // Create encoded raw email
  createRawEmail({ to, from, cc, bcc, subject, body, inReplyTo, references, threadId }) {
    const lines = [];

    if (to) lines.push(`To: ${to}`);
    if (from) lines.push(`From: ${from}`);
    if (cc) lines.push(`Cc: ${cc}`);
    if (bcc) lines.push(`Bcc: ${bcc}`);
    if (subject) lines.push(`Subject: ${subject}`);
    if (inReplyTo) lines.push(`In-Reply-To: ${inReplyTo}`);
    if (references) lines.push(`References: ${references}`);
    
    lines.push('MIME-Version: 1.0');
    lines.push('Content-Type: text/html; charset=utf-8');
    lines.push('Content-Transfer-Encoding: 7bit');
    lines.push('');
    lines.push(body || '');

    const email = lines.join('\r\n');
    return Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async sendMessage({ to, cc, bcc, subject, body, threadId, inReplyTo, references }) {
    if (!this.gmail) throw new Error('Gmail client is not authenticated');

    const raw = this.createRawEmail({
      to,
      cc,
      bcc,
      subject,
      body,
      inReplyTo,
      references,
      threadId
    });

    const res = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
        threadId: threadId || undefined
      }
    });

    return res.data;
  }

  async replyToMessage(messageId, body, tone = 'professional') {
    if (!this.gmail) throw new Error('Gmail client is not authenticated');

    const originalMessage = await this.getMessage(messageId);
    
    const to = originalMessage.from;
    const subject = originalMessage.subject.startsWith('Re:')
      ? originalMessage.subject
      : `Re: ${originalMessage.subject}`;
    const inReplyTo = originalMessage.messageIdHeader || originalMessage.id;
    const references = originalMessage.messageIdHeader || originalMessage.id;

    return this.sendMessage({
      to,
      subject,
      body,
      threadId: originalMessage.threadId,
      inReplyTo,
      references
    });
  }
}

module.exports = GmailIntegration;
