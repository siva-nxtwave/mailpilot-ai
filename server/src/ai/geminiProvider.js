const { GoogleGenerativeAI } = require('@google/generative-ai');
const BaseAIProvider = require('./baseAIProvider');
const config = require('../config/env');

class GeminiProvider extends BaseAIProvider {
  constructor() {
    super('gemini');
    this.apiKey = config.GEMINI_API_KEY;
    this.modelName = config.GEMINI_MODEL || 'gemini-1.5-flash';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async callModel(prompt) {
    if (!this.genAI) throw new Error('Gemini API key is not configured');
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async summarize(emailText, context = {}) {
    const prompt = `You are an AI email assistant. Analyze this email and return a JSON object with:
{
  "summary": "Short 2-3 sentence executive summary",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "importantDecisions": ["Decision 1"],
  "requests": ["Request 1"],
  "actionItems": [{"task": "Task description", "owner": "Person", "dueDate": "Date or null", "priority": "High|Medium|Low"}],
  "importantDates": [{"title": "Event/Deadline", "date": "Date string", "type": "Deadline|Meeting|Payment|Other"}]
}
Return ONLY valid raw JSON with NO markdown formatting or backticks.

Subject: ${context.subject || 'N/A'}
From: ${context.from || 'N/A'}
Content:
${emailText}`;

    const raw = await this.callModel(prompt);
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
    const prompt = `Draft an email reply to this conversation.
Desired Tone: ${tone} (options: professional, friendly, formal, concise)
${customInstructions ? `Special Instructions: ${customInstructions}` : ''}
Sender: ${sender}

Thread Content:
${threadText}

Draft a clear, context-aware reply. Output only the email body without placeholders like [Your Name].`;

    const reply = await this.callModel(prompt);
    return reply.trim();
  }

  async explain(emailText) {
    const prompt = `Explain the following email in simple terms. Return JSON:
{
  "whatSenderWants": "Clear explanation of sender's goal",
  "whyItMatters": "Context and urgency",
  "requiredResponse": "What is expected from the recipient",
  "importantDetails": ["Key note 1", "Key note 2"]
}
Return ONLY raw JSON with no backticks.

Email:
${emailText}`;

    const raw = await this.callModel(prompt);
    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson);
    } catch {
      return {
        whatSenderWants: raw,
        whyItMatters: 'Important communication',
        requiredResponse: 'Review and reply if necessary',
        importantDetails: []
      };
    }
  }

  async extractActionItems(emailText) {
    const prompt = `Extract action items from the email as JSON:
{
  "actionItems": [
    { "task": "Action item", "owner": "Assigned person", "dueDate": "Due date or 'Not specified'", "priority": "High" | "Medium" | "Low" }
  ]
}
Return ONLY raw JSON with no backticks.

Email:
${emailText}`;

    const raw = await this.callModel(prompt);
    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson).actionItems || [];
    } catch {
      return [];
    }
  }

  async extractDates(emailText) {
    const prompt = `Extract all mentioned dates and deadlines from the email as JSON:
{
  "dates": [
    { "title": "Meeting or deadline", "date": "Date/Time string", "type": "Meeting" | "Deadline" | "Payment" | "Appointment" | "Other" }
  ]
}
Return ONLY raw JSON with no backticks.

Email:
${emailText}`;

    const raw = await this.callModel(prompt);
    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson).dates || [];
    } catch {
      return [];
    }
  }

  async rewrite(text, tone = 'professional') {
    const prompt = `Rewrite the following draft email text with the tone '${tone}'. Return only the rewritten text.\n\nDraft:\n${text}`;
    const res = await this.callModel(prompt);
    return res.trim();
  }

  async generateSubject(bodyText) {
    const prompt = `Suggest 3 concise subject lines for this email body. Return JSON:
{
  "subjects": ["Subject 1", "Subject 2", "Subject 3"]
}
Return ONLY raw JSON.

Email Body:
${bodyText}`;

    const raw = await this.callModel(prompt);
    try {
      const cleanJson = raw.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      return JSON.parse(cleanJson).subjects || [];
    } catch {
      return ['Project Follow-up', 'Important Update', 'Regarding our conversation'];
    }
  }
}

module.exports = GeminiProvider;
