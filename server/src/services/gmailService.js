const GmailConnection = require('../models/GmailConnection');
const GmailIntegration = require('../integrations/gmailIntegration');
const { encryptToken, decryptToken } = require('./tokenService');
const { logActivity } = require('./activityService');
const { createNotification } = require('./notificationService');

// Initial Template Demo Emails for interactive preview before OAuth is connected
const createInitialDemoEmails = () => [
  {
    id: 'demo_msg_1',
    threadId: 'demo_thread_1',
    snippet: 'Hi Alex, here is the updated Q3 Project Roadmap and the deliverables for next Tuesday...',
    from: 'Sarah Chen <sarah.chen@techcorp.io>',
    to: 'me',
    cc: '',
    bcc: '',
    subject: 'Q3 Product Roadmap & Deliverables Review',
    date: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    internalDate: String(Date.now() - 1000 * 60 * 35),
    labels: ['INBOX', 'IMPORTANT', 'UNREAD', 'STARRED'],
    isUnread: true,
    isStarred: true,
    isDraft: false,
    isTrash: false,
    hasAttachments: true,
    attachments: [{ id: 'att_1', filename: 'Q3_Roadmap_Final.pdf', mimeType: 'application/pdf', size: 2450000 }],
    bodyText: `Hi Alex,

Hope your week is going well!

I wanted to share the updated Q3 Product Roadmap before our leadership sync next Tuesday at 2:00 PM PST.

Key highlights:
1. AI Email Summarization & Smart Replies module deployment slated for September 15.
2. OAuth 2.0 Security audit review completed with zero high vulnerabilities.
3. User satisfaction benchmark reached 94.8% in pilot tests.

Please review the attached slide deck and confirm if the proposed budget allocations look good on your end by Monday end-of-day.

Thanks,
Sarah Chen
VP of Product, TechCorp`,
    bodyHtml: `<p>Hi Alex,</p><p>Hope your week is going well!</p><p>I wanted to share the updated <strong>Q3 Product Roadmap</strong> before our leadership sync next Tuesday at 2:00 PM PST.</p><p><strong>Key highlights:</strong></p><ul><li>AI Email Summarization & Smart Replies module deployment slated for September 15.</li><li>OAuth 2.0 Security audit review completed with zero high vulnerabilities.</li><li>User satisfaction benchmark reached 94.8% in pilot tests.</li></ul><p>Please review the attached slide deck and confirm if the proposed budget allocations look good on your end by Monday end-of-day.</p><p>Thanks,<br/><strong>Sarah Chen</strong><br/>VP of Product, TechCorp</p>`
  },
  {
    id: 'demo_msg_2',
    threadId: 'demo_thread_2',
    snippet: 'Invoice #INV-2026-891 is ready for review. Payment due within 14 days.',
    from: 'Billing Team <billing@cloudservices.net>',
    to: 'me',
    cc: '',
    bcc: '',
    subject: 'Monthly Cloud Services Invoice - Aug 2026 (#INV-2026-891)',
    date: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    internalDate: String(Date.now() - 1000 * 60 * 180),
    labels: ['INBOX'],
    isUnread: false,
    isStarred: false,
    isDraft: false,
    isTrash: false,
    hasAttachments: true,
    attachments: [{ id: 'att_2', filename: 'Invoice_INV-2026-891.pdf', mimeType: 'application/pdf', size: 180000 }],
    bodyText: `Dear Customer,

Your monthly subscription invoice for August 2026 is now available.

Amount Due: $429.50
Due Date: September 10, 2026
Payment Method: Auto-charge Visa ending in 4242

You can review or download your invoice in your customer portal.

Best regards,
CloudServices Billing`,
    bodyHtml: `<p>Dear Customer,</p><p>Your monthly subscription invoice for August 2026 is now available.</p><p><strong>Amount Due:</strong> $429.50<br/><strong>Due Date:</strong> September 10, 2026<br/><strong>Payment Method:</strong> Auto-charge Visa ending in 4242</p><p>You can review or download your invoice in your customer portal.</p><p>Best regards,<br/>CloudServices Billing</p>`
  },
  {
    id: 'demo_msg_3',
    threadId: 'demo_thread_3',
    snippet: 'Could we reschedule our 1-on-1 meeting to Thursday at 3 PM?',
    from: 'Marcus Wright <m.wright@partnerstudio.co>',
    to: 'me',
    cc: '',
    bcc: '',
    subject: 'Reschedule: Weekly Partnership Sync',
    date: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    internalDate: String(Date.now() - 1000 * 60 * 60 * 12),
    labels: ['INBOX', 'UNREAD'],
    isUnread: true,
    isStarred: false,
    isDraft: false,
    isTrash: false,
    hasAttachments: false,
    attachments: [],
    bodyText: `Hey Alex,

I have an urgent client demo overlapping with our scheduled sync tomorrow. Would it be possible to push our 1-on-1 meeting to Thursday at 3:00 PM EST?

Let me know if that time slot works for you or if Friday morning is better.

Cheers,
Marcus`,
    bodyHtml: `<p>Hey Alex,</p><p>I have an urgent client demo overlapping with our scheduled sync tomorrow. Would it be possible to push our 1-on-1 meeting to <strong>Thursday at 3:00 PM EST</strong>?</p><p>Let me know if that time slot works for you or if Friday morning is better.</p><p>Cheers,<br/>Marcus</p>`
  },
  {
    id: 'demo_msg_sent_1',
    threadId: 'demo_thread_sent_1',
    snippet: 'Hi David, following up on our discussion yesterday regarding the AI integration agreement...',
    from: 'me',
    to: 'david.miller@apexcorp.com',
    cc: '',
    bcc: '',
    subject: 'Follow-up: Enterprise AI Pilot Agreement',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    internalDate: String(Date.now() - 1000 * 60 * 60 * 24),
    labels: ['SENT'],
    isUnread: false,
    isStarred: false,
    isDraft: false,
    isTrash: false,
    hasAttachments: false,
    attachments: [],
    bodyText: `Hi David,

Thank you for the productive call yesterday. As discussed, I have forwarded the preliminary pilot scope to our legal team.

We look forward to kicking off the beta deployment on October 1st.

Best regards,
Alex`,
    bodyHtml: `<p>Hi David,</p><p>Thank you for the productive call yesterday. As discussed, I have forwarded the preliminary pilot scope to our legal team.</p><p>We look forward to kicking off the beta deployment on October 1st.</p><p>Best regards,<br/>Alex</p>`
  },
  {
    id: 'demo_msg_draft_1',
    threadId: 'demo_thread_draft_1',
    snippet: 'Team, here are the proposed Q4 Engineering key objectives and architecture milestones...',
    from: 'me',
    to: 'tech-leads@mailpilot.ai',
    cc: '',
    bcc: '',
    subject: 'Draft: Q4 Engineering Key Objectives',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    internalDate: String(Date.now() - 1000 * 60 * 60 * 48),
    labels: ['DRAFT'],
    isUnread: false,
    isStarred: false,
    isDraft: true,
    isTrash: false,
    hasAttachments: false,
    attachments: [],
    bodyText: `Team,

Here are the draft bullet points for our upcoming sprint:
- Implement socket streaming for instantaneous AI replies
- Expand multi-tier AI fallback engine latency benchmarking
- Finalize OAuth token encryption security audit

Let me know your feedback.`,
    bodyHtml: `<p>Team,</p><p>Here are the draft bullet points for our upcoming sprint:</p><ul><li>Implement socket streaming for instantaneous AI replies</li><li>Expand multi-tier AI fallback engine latency benchmarking</li><li>Finalize OAuth token encryption security audit</li></ul><p>Let me know your feedback.</p>`
  },
  {
    id: 'demo_msg_trash_1',
    threadId: 'demo_thread_trash_1',
    snippet: 'Special offer: Save 40% on cloud server upgrades this weekend only...',
    from: 'Promotions <offers@clouddeals.net>',
    to: 'me',
    cc: '',
    bcc: '',
    subject: '[Promo] 40% Off Cloud Hosting Upgrades',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    internalDate: String(Date.now() - 1000 * 60 * 60 * 72),
    labels: ['TRASH'],
    isUnread: false,
    isStarred: false,
    isDraft: false,
    isTrash: true,
    hasAttachments: false,
    attachments: [],
    bodyText: `Save 40% on your cloud computing infrastructure. Click here to upgrade before Sunday midnight.`,
    bodyHtml: `<p>Save 40% on your cloud computing infrastructure. Click here to upgrade before Sunday midnight.</p>`
  }
];

// Per-user in-memory mailbox store for demo/sandbox mode
const demoMailboxStores = new Map();

const getUserDemoEmails = (userId) => {
  const key = String(userId || 'default_demo');
  if (!demoMailboxStores.has(key)) {
    demoMailboxStores.set(key, createInitialDemoEmails());
  }
  return demoMailboxStores.get(key);
};

class GmailService {
  getOAuthUrl(userId = null) {
    const integration = new GmailIntegration();
    return integration.getAuthorizationUrl(userId);
  }

  async handleOAuthCallback(userId, code) {
    const integration = new GmailIntegration();
    const { tokens, email } = await integration.handleOAuthCallback(code);

    const encryptedAccess = encryptToken(tokens.access_token);
    const encryptedRefresh = tokens.refresh_token ? encryptToken(tokens.refresh_token) : undefined;
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

    const updateData = {
      provider: 'gmail',
      googleAccountEmail: email,
      isConnected: true,
      scopes: tokens.scope ? tokens.scope.split(' ') : [],
      encryptedAccessToken: encryptedAccess,
      expiresAt,
      connectedAt: new Date()
    };

    if (encryptedRefresh) {
      updateData.encryptedRefreshToken = encryptedRefresh;
    }

    const connection = await GmailConnection.findOneAndUpdate(
      { owner: userId },
      { $set: updateData },
      { upsert: true, new: true }
    );

    await logActivity({
      owner: userId,
      action: 'GMAIL_CONNECTED',
      metadata: { googleAccountEmail: email }
    });

    await createNotification({
      owner: userId,
      type: 'GMAIL_CONNECTED',
      title: 'Gmail Connected Successfully',
      message: `Your Google account ${email} is now connected to MailPilot.`
    });

    return {
      isConnected: true,
      googleAccountEmail: email,
      connectedAt: connection.connectedAt
    };
  }

  async getConnectionStatus(userId) {
    const connection = await GmailConnection.findOne({ owner: userId });
    if (!connection || !connection.isConnected) {
      return {
        isConnected: false,
        googleAccountEmail: null,
        expiresAt: null,
        scopes: []
      };
    }

    return {
      isConnected: true,
      googleAccountEmail: connection.googleAccountEmail,
      expiresAt: connection.expiresAt,
      scopes: connection.scopes,
      connectedAt: connection.connectedAt
    };
  }

  async disconnect(userId) {
    const connection = await GmailConnection.findOneAndUpdate(
      { owner: userId },
      {
        $set: {
          isConnected: false,
          encryptedAccessToken: null,
          encryptedRefreshToken: null
        }
      },
      { new: true }
    );

    await logActivity({
      owner: userId,
      action: 'GMAIL_DISCONNECTED'
    });

    return { success: true, isConnected: false };
  }

  async getAuthenticatedIntegration(userId) {
    const connection = await GmailConnection.findOne({ owner: userId });
    if (!connection || !connection.isConnected || !connection.encryptedAccessToken) {
      return null;
    }

    try {
      const accessToken = decryptToken(connection.encryptedAccessToken);
      const refreshToken = connection.encryptedRefreshToken ? decryptToken(connection.encryptedRefreshToken) : null;

      const integration = new GmailIntegration({
        accessToken,
        refreshToken,
        expiryDate: connection.expiresAt ? new Date(connection.expiresAt).getTime() : undefined
      });

      // Listen for token refresh event to re-encrypt and persist
      integration.oauth2Client.on('tokens', async (newTokens) => {
        try {
          const update = {};
          if (newTokens.access_token) {
            update.encryptedAccessToken = encryptToken(newTokens.access_token);
          }
          if (newTokens.refresh_token) {
            update.encryptedRefreshToken = encryptToken(newTokens.refresh_token);
          }
          if (newTokens.expiry_date) {
            update.expiresAt = new Date(newTokens.expiry_date);
          }
          await GmailConnection.updateOne({ owner: userId }, { $set: update });
        } catch (tokErr) {
          console.error('Failed to persist refreshed token:', tokErr.message);
        }
      });

      return integration;
    } catch (err) {
      console.error('Error creating authenticated Gmail integration:', err.message);
      return null;
    }
  }

  async getMessages(userId, options = {}) {
    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) {
      const allDemo = getUserDemoEmails(userId);
      const folder = (options.folder || 'INBOX').toUpperCase();
      const q = (options.q || '').trim().toLowerCase();

      let filtered = allDemo.filter(e => {
        if (folder === 'INBOX') {
          return e.labels.includes('INBOX') && !e.isTrash && !e.labels.includes('TRASH');
        }
        if (folder === 'STARRED') {
          return e.isStarred && !e.isTrash && !e.labels.includes('TRASH');
        }
        if (folder === 'SENT') {
          return e.labels.includes('SENT') && !e.isTrash && !e.labels.includes('TRASH');
        }
        if (folder === 'DRAFT' || folder === 'DRAFTS') {
          return (e.isDraft || e.labels.includes('DRAFT')) && !e.isTrash && !e.labels.includes('TRASH');
        }
        if (folder === 'TRASH') {
          return e.isTrash || e.labels.includes('TRASH');
        }
        if (folder === 'IMPORTANT') {
          return e.labels.includes('IMPORTANT') && !e.isTrash && !e.labels.includes('TRASH');
        }
        if (folder === 'ARCHIVE') {
          return !e.labels.includes('INBOX') && !e.isTrash && !e.labels.includes('TRASH') && !e.isDraft;
        }
        return true;
      });

      if (q) {
        filtered = filtered.filter(e =>
          e.subject.toLowerCase().includes(q) ||
          e.bodyText.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q) ||
          e.to.toLowerCase().includes(q)
        );
      }

      return {
        messages: filtered,
        nextPageToken: null,
        resultSizeEstimate: filtered.length,
        isDemo: true
      };
    }

    try {
      const result = await integration.getMessages(options);
      return { ...result, isDemo: false };
    } catch (err) {
      if (err.message && err.message.includes('invalid_grant')) {
        const error = new Error('Gmail authentication expired. Please reconnect Gmail.');
        error.code = 'AUTH_EXPIRED';
        error.statusCode = 401;
        throw error;
      }
      throw err;
    }
  }

  async getMessage(userId, messageId) {
    if (messageId && messageId.startsWith('demo_')) {
      const userEmails = getUserDemoEmails(userId);
      const demo = userEmails.find(e => e.id === messageId);
      if (demo) return demo;
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) {
      const userEmails = getUserDemoEmails(userId);
      const demo = userEmails.find(e => e.id === messageId) || userEmails[0];
      return demo;
    }

    const msg = await integration.getMessage(messageId);
    await logActivity({
      owner: userId,
      action: 'EMAIL_VIEWED',
      messageId: msg.id,
      threadId: msg.threadId,
      metadata: { subject: msg.subject, from: msg.from }
    }).catch(() => {});

    return msg;
  }

  async getThread(userId, threadId) {
    if (threadId && threadId.startsWith('demo_')) {
      const userEmails = getUserDemoEmails(userId);
      const matchedMessages = userEmails.filter(e => e.threadId === threadId);
      const primary = matchedMessages[0] || userEmails[0];
      return {
        id: primary.threadId,
        subject: primary.subject,
        participants: [primary.from, primary.to],
        messageCount: matchedMessages.length || 1,
        messages: matchedMessages.length ? matchedMessages : [primary],
        isDemo: true
      };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) {
      const userEmails = getUserDemoEmails(userId);
      const demo = userEmails[0];
      return {
        id: demo.threadId,
        subject: demo.subject,
        participants: [demo.from, demo.to],
        messageCount: 1,
        messages: [demo],
        isDemo: true
      };
    }

    return integration.getThread(threadId);
  }

  async searchMessages(userId, query, options = {}) {
    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) {
      const userEmails = getUserDemoEmails(userId);
      const q = (query || '').toLowerCase();
      const filtered = userEmails.filter(e =>
        !e.isTrash &&
        (e.subject.toLowerCase().includes(q) ||
        e.bodyText.toLowerCase().includes(q) ||
        e.from.toLowerCase().includes(q))
      );
      return { messages: filtered, nextPageToken: null, resultSizeEstimate: filtered.length, isDemo: true };
    }

    return integration.searchMessages(query, options);
  }

  async markAsRead(userId, messageId) {
    const userEmails = getUserDemoEmails(userId);
    const demo = userEmails.find(e => e.id === messageId);
    if (demo) {
      demo.isUnread = false;
      demo.labels = demo.labels.filter(l => l !== 'UNREAD');
      return { success: true };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) throw new Error('Gmail not connected');

    await integration.modifyMessage(messageId, { removeLabelIds: ['UNREAD'] });
    await logActivity({ owner: userId, action: 'EMAIL_MARKED_READ', messageId });
    return { success: true };
  }

  async markAsUnread(userId, messageId) {
    const userEmails = getUserDemoEmails(userId);
    const demo = userEmails.find(e => e.id === messageId);
    if (demo) {
      demo.isUnread = true;
      if (!demo.labels.includes('UNREAD')) demo.labels.push('UNREAD');
      return { success: true };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) throw new Error('Gmail not connected');

    await integration.modifyMessage(messageId, { addLabelIds: ['UNREAD'] });
    await logActivity({ owner: userId, action: 'EMAIL_MARKED_UNREAD', messageId });
    return { success: true };
  }

  async starMessage(userId, messageId) {
    const userEmails = getUserDemoEmails(userId);
    const demo = userEmails.find(e => e.id === messageId);
    if (demo) {
      demo.isStarred = true;
      if (!demo.labels.includes('STARRED')) demo.labels.push('STARRED');
      return { success: true };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) throw new Error('Gmail not connected');

    await integration.modifyMessage(messageId, { addLabelIds: ['STARRED'] });
    await logActivity({ owner: userId, action: 'EMAIL_STARRED', messageId });
    return { success: true };
  }

  async unstarMessage(userId, messageId) {
    const userEmails = getUserDemoEmails(userId);
    const demo = userEmails.find(e => e.id === messageId);
    if (demo) {
      demo.isStarred = false;
      demo.labels = demo.labels.filter(l => l !== 'STARRED');
      return { success: true };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) throw new Error('Gmail not connected');

    await integration.modifyMessage(messageId, { removeLabelIds: ['STARRED'] });
    await logActivity({ owner: userId, action: 'EMAIL_UNSTARRED', messageId });
    return { success: true };
  }

  async archiveMessage(userId, messageId) {
    const userEmails = getUserDemoEmails(userId);
    const demo = userEmails.find(e => e.id === messageId);
    if (demo) {
      demo.labels = demo.labels.filter(l => l !== 'INBOX');
      await logActivity({ owner: userId, action: 'EMAIL_ARCHIVED', messageId });
      return { success: true };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) throw new Error('Gmail not connected');

    await integration.modifyMessage(messageId, { removeLabelIds: ['INBOX'] });
    await logActivity({ owner: userId, action: 'EMAIL_ARCHIVED', messageId });
    return { success: true };
  }

  async trashMessage(userId, messageId) {
    const userEmails = getUserDemoEmails(userId);
    const demoIndex = userEmails.findIndex(e => e.id === messageId);
    if (demoIndex !== -1) {
      const demo = userEmails[demoIndex];
      if (demo.isTrash || demo.labels.includes('TRASH')) {
        // Permanently remove if already in trash
        userEmails.splice(demoIndex, 1);
      } else {
        demo.isTrash = true;
        demo.labels = demo.labels.filter(l => l !== 'INBOX');
        if (!demo.labels.includes('TRASH')) demo.labels.push('TRASH');
      }
      await logActivity({ owner: userId, action: 'EMAIL_DELETED', messageId });
      return { success: true };
    }

    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) throw new Error('Gmail not connected');

    await integration.modifyMessage(messageId, { addLabelIds: ['TRASH'], removeLabelIds: ['INBOX'] });
    await logActivity({ owner: userId, action: 'EMAIL_DELETED', messageId });
    return { success: true };
  }

  async bulkModify(userId, messageIds = [], action = 'read') {
    const results = [];
    for (const id of messageIds) {
      try {
        if (action === 'read') await this.markAsRead(userId, id);
        else if (action === 'unread') await this.markAsUnread(userId, id);
        else if (action === 'star') await this.starMessage(userId, id);
        else if (action === 'archive') await this.archiveMessage(userId, id);
        else if (action === 'trash') await this.trashMessage(userId, id);
        results.push({ id, success: true });
      } catch (err) {
        results.push({ id, success: false, error: err.message });
      }
    }
    return { success: true, processed: results };
  }

  async sendEmail(userId, messageData) {
    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) {
      // In sandbox mode, add the sent email to user's demo mailbox
      const userEmails = getUserDemoEmails(userId);
      const newSentEmail = {
        id: 'demo_msg_sent_' + Date.now(),
        threadId: 'demo_thread_sent_' + Date.now(),
        snippet: (messageData.body || '').substring(0, 100),
        from: 'me',
        to: messageData.to,
        cc: messageData.cc || '',
        bcc: messageData.bcc || '',
        subject: messageData.subject || '(No Subject)',
        date: new Date().toISOString(),
        internalDate: String(Date.now()),
        labels: ['SENT'],
        isUnread: false,
        isStarred: false,
        isDraft: false,
        isTrash: false,
        hasAttachments: false,
        attachments: [],
        bodyText: messageData.body || '',
        bodyHtml: `<p>${(messageData.body || '').replace(/\n/g, '<br/>')}</p>`
      };
      userEmails.unshift(newSentEmail);

      await logActivity({
        owner: userId,
        action: 'EMAIL_SENT',
        metadata: { to: messageData.to, subject: messageData.subject, sandbox: true }
      });
      await createNotification({
        owner: userId,
        type: 'EMAIL_SENT',
        title: 'Email Sent (Demo Mode)',
        message: `Your message to ${messageData.to} was dispatched in demo sandbox mode.`
      });
      return { id: newSentEmail.id, success: true, sandbox: true };
    }

    const res = await integration.sendMessage(messageData);
    await logActivity({
      owner: userId,
      action: 'EMAIL_SENT',
      messageId: res.id,
      threadId: res.threadId,
      metadata: { to: messageData.to, subject: messageData.subject }
    });

    await createNotification({
      owner: userId,
      type: 'EMAIL_SENT',
      title: 'Email Sent Successfully',
      message: `Your message "${messageData.subject}" to ${messageData.to} has been sent.`,
      messageId: res.id,
      threadId: res.threadId
    });

    return res;
  }

  async replyToEmail(userId, messageId, body, tone = 'professional') {
    const integration = await this.getAuthenticatedIntegration(userId);
    if (!integration) {
      const userEmails = getUserDemoEmails(userId);
      const original = userEmails.find(e => e.id === messageId) || userEmails[0];
      const replyMsg = {
        id: 'demo_msg_reply_' + Date.now(),
        threadId: original.threadId,
        snippet: (body || '').substring(0, 100),
        from: 'me',
        to: original.from,
        cc: '',
        bcc: '',
        subject: original.subject.startsWith('Re:') ? original.subject : `Re: ${original.subject}`,
        date: new Date().toISOString(),
        internalDate: String(Date.now()),
        labels: ['SENT'],
        isUnread: false,
        isStarred: false,
        isDraft: false,
        isTrash: false,
        hasAttachments: false,
        attachments: [],
        bodyText: body || '',
        bodyHtml: `<p>${(body || '').replace(/\n/g, '<br/>')}</p>`
      };
      userEmails.push(replyMsg);

      await logActivity({
        owner: userId,
        action: 'EMAIL_SENT',
        messageId,
        metadata: { isReply: true, tone, sandbox: true }
      });
      return { id: replyMsg.id, success: true, sandbox: true };
    }

    const res = await integration.replyToMessage(messageId, body, tone);
    await logActivity({
      owner: userId,
      action: 'EMAIL_SENT',
      messageId: res.id,
      threadId: res.threadId,
      metadata: { isReply: true, originalMessageId: messageId, tone }
    });

    return res;
  }
}

module.exports = new GmailService();

