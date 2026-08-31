const axios = require('axios');
const BaseAIProvider = require('./baseAIProvider');
const config = require('../config/env');

class OpenRouterProvider extends BaseAIProvider {
  constructor() {
    super('openrouter');
    this.apiKey = config.OPENROUTER_API_KEY;
    this.model = config.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async callModel(messages, temperature = 0.3) {
    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages,
        temperature
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.CLIENT_URL,
          'X-Title': 'MailPilot AI'
        },
        timeout: 30000
      }
    );

    return response.data?.choices?.[0]?.message?.content || '';
  }

  async summarize(emailText, context = {}) {
    const systemPrompt = `You are an expert AI email executive assistant. Analyze the given email/thread and return a JSON object with this EXACT structure:
{
  "summary": "Short 2-3 sentence executive summary",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "importantDecisions": ["Decision 1"],
  "requests": ["What is requested"],
  "actionItems": [{"task": "Task description", "owner": "Person", "dueDate": "Date or null", "priority": "High|Medium|Low"}],
  "importantDates": [{"title": "Event/Deadline", "date": "Date string", "type": "Deadline|Meeting|Payment|Other"}]
}
Return ONLY valid JSON with no markdown wrapping.`;

    const prompt = `Email Subject: ${context.subject || 'N/A'}\nSender: ${context.from || 'N/A'}\n\nEmail Content:\n${emailText}`;
    const raw = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ]);

    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return {
        summary: raw.substring(0, 300),
        keyPoints: [raw.substring(0, 150)],
        importantDecisions: [],
        requests: [],
        actionItems: [],
        importantDates: []
      };
    }
  }

  async generateReply(threadText, { tone = 'professional', customInstructions = '', sender = '' } = {}) {
    const systemPrompt = `You are an AI email assistant drafting a reply.
Tone desired: ${tone} (e.g. professional, friendly, formal, concise).
${customInstructions ? `Additional user instructions: ${customInstructions}` : ''}
Draft a complete, contextual email reply addressing the sender's points accurately.
Do not include subject lines or placeholders like [Your Name]. Sign off appropriately.`;

    const prompt = `Sender: ${sender}\n\nConversation Thread:\n${threadText}`;
    const reply = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ], 0.5);

    return reply.trim();
  }

  async explain(emailText) {
    const systemPrompt = `Analyze the given email and explain it simply in JSON:
{
  "whatSenderWants": "Clear explanation of sender's intent",
  "whyItMatters": "Why this email is important or relevant",
  "requiredResponse": "What kind of response is expected",
  "importantDetails": ["Key point 1", "Key point 2"]
}
Return ONLY valid JSON.`;

    const raw = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: emailText }
    ]);

    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return {
        whatSenderWants: raw,
        whyItMatters: 'General communication',
        requiredResponse: 'Review and acknowledge if required',
        importantDetails: []
      };
    }
  }

  async extractActionItems(emailText) {
    const systemPrompt = `Extract action items from the email in JSON:
{
  "actionItems": [
    { "task": "Specific task", "owner": "Assigned person", "dueDate": "Due date or 'Not specified'", "priority": "High" | "Medium" | "Low" }
  ]
}
Return ONLY valid JSON.`;

    const raw = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: emailText }
    ]);

    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson).actionItems || [];
    } catch {
      return [];
    }
  }

  async extractDates(emailText) {
    const systemPrompt = `Extract all mentioned dates, deadlines, and meetings in JSON:
{
  "dates": [
    { "title": "Meeting / Deadline / Milestone", "date": "Date and time", "type": "Meeting" | "Deadline" | "Payment" | "Appointment" | "Other" }
  ]
}
Return ONLY valid JSON.`;

    const raw = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: emailText }
    ]);

    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson).dates || [];
    } catch {
      return [];
    }
  }

  async rewrite(text, tone = 'professional') {
    const systemPrompt = `Rewrite the following email draft according to the tone '${tone}' (options: professional, friendlier, shorter, formal, clearer). Output only the revised text.`;
    const res = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ], 0.4);
    return res.trim();
  }

  async generateSubject(bodyText) {
    const systemPrompt = `Generate 3 concise, highly effective subject line suggestions for the email body. Return JSON:
{
  "subjects": ["Subject 1", "Subject 2", "Subject 3"]
}
Return ONLY valid JSON.`;
    const raw = await this.callModel([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: bodyText }
    ]);

    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson).subjects || [];
    } catch {
      return ['Follow up on our discussion', 'Project update', 'Quick inquiry'];
    }
  }
}

module.exports = OpenRouterProvider;
