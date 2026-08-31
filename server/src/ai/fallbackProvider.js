const BaseAIProvider = require('./baseAIProvider');

class FallbackProvider extends BaseAIProvider {
  constructor() {
    super('fallback');
  }

  isAvailable() {
    return true; // Always available as deterministic safety net
  }

  cleanText(text) {
    return (text || '').replace(/<[^>]*>?/gm, '').replace(/\r\n/g, '\n').trim();
  }

  summarize(emailText, context = {}) {
    const clean = this.cleanText(emailText);
    const lines = clean.split('\n').map(l => l.trim()).filter(l => l.length > 15);

    // Heuristic summary extraction
    const summaryLines = lines.slice(0, 3).join(' ');
    const summary = summaryLines.length > 0 ? summaryLines : `Email regarding ${context.subject || 'recent conversation'}.`;

    // Key points from bullet-like or declarative lines
    const keyPoints = lines
      .filter(l => /^[0-9•\-\*]/.test(l) || l.includes('highlight') || l.includes('review') || l.includes('update'))
      .slice(0, 4)
      .map(l => l.replace(/^[0-9•\-\*\.\s]+/, ''));

    if (keyPoints.length === 0 && lines.length > 1) {
      keyPoints.push(lines[1]);
    }

    const actionItems = this.extractActionItems(emailText);
    const importantDates = this.extractDates(emailText);

    const requests = lines
      .filter(l => l.includes('?') || l.toLowerCase().includes('please') || l.toLowerCase().includes('could you'))
      .slice(0, 2);

    return {
      summary: summary.substring(0, 260) + (summary.length > 260 ? '...' : ''),
      keyPoints: keyPoints.length > 0 ? keyPoints : ['Review email thread content and attachments.'],
      importantDecisions: ['Awaiting your feedback and confirmation.'],
      requests: requests.length > 0 ? requests : ['Review message and provide response.'],
      actionItems,
      importantDates
    };
  }

  generateReply(threadText, { tone = 'professional', customInstructions = '', sender = '' } = {}) {
    const clean = this.cleanText(threadText);
    const senderName = sender ? sender.split('<')[0].replace(/["']/g, '').trim() : 'there';

    let greeting = `Hi ${senderName},`;
    let signOff = 'Best regards,\nAlex';

    if (tone === 'formal') {
      greeting = `Dear ${senderName},`;
      signOff = 'Sincerely,\nAlex';
    } else if (tone === 'friendly') {
      greeting = `Hey ${senderName}!`;
      signOff = 'Cheers,\nAlex';
    } else if (tone === 'concise') {
      greeting = `Hi ${senderName},`;
      signOff = 'Thanks,\nAlex';
    }

    let coreBody = '';
    if (tone === 'concise') {
      coreBody = `Thank you for the update. Everything looks good on my end.\n\n${customInstructions ? `Regarding your note: ${customInstructions}\n\n` : ''}I will follow up shortly with any additional details.`;
    } else if (tone === 'friendly') {
      coreBody = `Thanks so much for reaching out with these details!\n\nI took a look through your message and the proposed timeline looks great. ${customInstructions ? `${customInstructions}\n\n` : ''}Looking forward to catching up soon.`;
    } else if (tone === 'formal') {
      coreBody = `Thank you for your correspondence.\n\nI acknowledge receipt of your message and have reviewed the contents. ${customInstructions ? `${customInstructions}\n\n` : ''}Please let me know if any further documentation or approval is required from our side.`;
    } else {
      // Professional default
      coreBody = `Thank you for sharing this update.\n\nI have reviewed the information provided and confirm everything aligns with our current priorities. ${customInstructions ? `${customInstructions}\n\n` : ''}Please feel free to proceed accordingly, and let me know if you need anything further from my end.`;
    }

    return `${greeting}\n\n${coreBody}\n\n${signOff}`;
  }

  explain(emailText) {
    const clean = this.cleanText(emailText);
    const lines = clean.split('\n').filter(l => l.trim().length > 10);

    const hasUrgency = /urgent|asap|deadline|due|by\s(monday|tuesday|wednesday|thursday|friday)/i.test(clean);
    const hasQuestion = /\?|could you|please/i.test(clean);

    return {
      whatSenderWants: lines[0] || 'The sender is requesting information or providing an important status update.',
      whyItMatters: hasUrgency ? 'This message has immediate timeline constraints or requested deliverables.' : 'Standard operational coordination and project alignment.',
      requiredResponse: hasQuestion ? 'Review details and reply to confirm or provide the requested feedback.' : 'Acknowledge receipt or take noted actions.',
      importantDetails: lines.slice(1, 4)
    };
  }

  extractActionItems(emailText) {
    const clean = this.cleanText(emailText);
    const lines = clean.split('\n');
    const items = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (/(please\s(review|confirm|send|check|verify)|due\sby|deadline|action\srequired|reschedule)/i.test(trimmed)) {
        items.push({
          task: trimmed.replace(/^[0-9•\-\*\.\s]+/, '').substring(0, 120),
          owner: 'Alex',
          dueDate: /monday|tuesday|wednesday|thursday|friday|\d{1,2}\s(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(trimmed) ? 'Upcoming Date' : 'Not specified',
          priority: /urgent|asap|today|eod/i.test(trimmed) ? 'High' : 'Medium'
        });
      }
    }

    if (items.length === 0) {
      items.push({
        task: 'Review email thread and confirm receipt',
        owner: 'Alex',
        dueDate: 'Not specified',
        priority: 'Medium'
      });
    }

    return items.slice(0, 4);
  }

  extractDates(emailText) {
    const clean = this.cleanText(emailText);
    const dates = [];

    const regex = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|\b\d{1,2}(?:st|nd|rd|th)?\s+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)|(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2})(?:\s+at\s+\d{1,2}(?::\d{2})?\s*(?:am|pm|est|pst|utc)?)?/gi;

    let match;
    while ((match = regex.exec(clean)) !== null) {
      const dateStr = match[0];
      const surrounding = clean.substring(Math.max(0, match.index - 30), Math.min(clean.length, match.index + 50)).replace(/\n/g, ' ');
      dates.push({
        title: surrounding.trim().substring(0, 60),
        date: dateStr,
        type: /sync|meeting|call|demo/i.test(surrounding) ? 'Meeting' : /due|invoice|payment/i.test(surrounding) ? 'Payment' : 'Deadline'
      });
    }

    if (dates.length === 0) {
      dates.push({
        title: 'General Follow-up',
        date: 'Next business day',
        type: 'Deadline'
      });
    }

    return dates.slice(0, 4);
  }

  rewrite(text, tone = 'professional') {
    const clean = (text || '').trim();
    if (!clean) return '';

    if (tone === 'shorter' || tone === 'concise') {
      return clean.split('\n')[0] + ' Thank you for your support.';
    } else if (tone === 'friendlier' || tone === 'friendly') {
      return `Hi there,\n\n${clean}\n\nHope this helps and looking forward to catching up soon!`;
    } else if (tone === 'formal') {
      return `Dear Sir/Madam,\n\nI am writing to communicate the following:\n${clean}\n\nThank you for your attention to this matter.\n\nSincerely.`;
    } else {
      // professional
      return `Hello,\n\nI would like to provide the following update:\n${clean}\n\nPlease let me know if you have any questions.\n\nBest regards.`;
    }
  }

  generateSubject(bodyText) {
    const clean = this.cleanText(bodyText);
    const firstWords = clean.split(/\s+/).slice(0, 5).join(' ');

    return [
      `Update: ${firstWords || 'Project Follow-up'}`,
      `Action Required: ${firstWords || 'Weekly Review'}`,
      `Regarding: ${firstWords || 'Collaboration'}`
    ];
  }
}

module.exports = FallbackProvider;
