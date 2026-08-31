const OpenRouterProvider = require('../ai/openrouterProvider');
const GeminiProvider = require('../ai/geminiProvider');
const FallbackProvider = require('../ai/fallbackProvider');
const AIRequest = require('../models/AIRequest');
const { logActivity } = require('./activityService');
const { createNotification } = require('./notificationService');
const { emitToUser } = require('../config/socket');

class AIService {
  constructor() {
    this.openrouter = new OpenRouterProvider();
    this.gemini = new GeminiProvider();
    this.fallback = new FallbackProvider();
  }

  getProviderStatus() {
    return {
      openrouter: {
        configured: this.openrouter.isAvailable(),
        model: this.openrouter.model
      },
      gemini: {
        configured: this.gemini.isAvailable(),
        model: this.gemini.modelName
      },
      fallback: {
        configured: true,
        model: 'deterministic-nlp-engine'
      }
    };
  }

  async executeWithFallback(operationType, executor, userId, metadata = {}) {
    const startTime = Date.now();
    let providerName = 'fallback';
    let modelName = 'deterministic';
    let result = null;
    let error = null;

    emitToUser(userId.toString(), 'ai_operation_started', {
      type: operationType,
      messageId: metadata.messageId,
      threadId: metadata.threadId
    });

    // 1. Try OpenRouter
    if (this.openrouter.isAvailable()) {
      try {
        providerName = 'openrouter';
        modelName = this.openrouter.model;
        result = await executor(this.openrouter);
      } catch (err) {
        console.warn(`OpenRouter execution failed for ${operationType}:`, err.message);
        error = err.message;
      }
    }

    // 2. Try Gemini fallback
    if (!result && this.gemini.isAvailable()) {
      try {
        providerName = 'gemini';
        modelName = this.gemini.modelName;
        result = await executor(this.gemini);
        error = null;
      } catch (err) {
        console.warn(`Gemini execution failed for ${operationType}:`, err.message);
        error = err.message;
      }
    }

    // 3. Deterministic Fallback
    if (!result) {
      providerName = 'fallback';
      modelName = 'deterministic-nlp-engine';
      try {
        result = await executor(this.fallback);
        error = null;
      } catch (err) {
        console.error(`Fallback provider failed for ${operationType}:`, err.message);
        error = err.message;
      }
    }

    const duration = Date.now() - startTime;
    const success = Boolean(result);

    // Persist AI Request telemetry
    await AIRequest.create({
      owner: userId,
      type: operationType,
      messageId: metadata.messageId,
      threadId: metadata.threadId,
      provider: providerName,
      model: modelName,
      inputMetadata: {
        subject: metadata.subject,
        tone: metadata.tone,
        length: metadata.emailText ? metadata.emailText.length : 0
      },
      success,
      duration,
      error
    }).catch(err => console.error('Failed to log AIRequest:', err.message));

    // Persist EmailActivity
    await logActivity({
      owner: userId,
      action: success ? 'AI_OPERATION_COMPLETED' : 'AI_OPERATION_FAILED',
      messageId: metadata.messageId,
      threadId: metadata.threadId,
      metadata: { operationType, provider: providerName, model: modelName, duration },
      success,
      error
    });

    emitToUser(userId.toString(), 'ai_operation_completed', {
      type: operationType,
      provider: providerName,
      model: modelName,
      duration,
      success
    });

    if (!success) {
      throw new Error(`AI operation ${operationType} failed: ${error}`);
    }

    return {
      data: result,
      provider: providerName,
      model: modelName,
      duration
    };
  }

  async summarize(userId, emailText, context = {}) {
    return this.executeWithFallback(
      'SUMMARIZE',
      (provider) => provider.summarize(emailText, context),
      userId,
      { ...context, emailText }
    );
  }

  async generateReply(userId, threadText, options = {}) {
    return this.executeWithFallback(
      'GENERATE_REPLY',
      (provider) => provider.generateReply(threadText, options),
      userId,
      { ...options, emailText: threadText }
    );
  }

  async explain(userId, emailText, metadata = {}) {
    return this.executeWithFallback(
      'EXPLAIN',
      (provider) => provider.explain(emailText),
      userId,
      { ...metadata, emailText }
    );
  }

  async extractActionItems(userId, emailText, metadata = {}) {
    return this.executeWithFallback(
      'ACTION_ITEMS',
      (provider) => provider.extractActionItems(emailText),
      userId,
      { ...metadata, emailText }
    );
  }

  async extractDates(userId, emailText, metadata = {}) {
    return this.executeWithFallback(
      'EXTRACT_DATES',
      (provider) => provider.extractDates(emailText),
      userId,
      { ...metadata, emailText }
    );
  }

  async rewrite(userId, text, tone = 'professional') {
    return this.executeWithFallback(
      'REWRITE',
      (provider) => provider.rewrite(text, tone),
      userId,
      { tone, emailText: text }
    );
  }

  async generateSubject(userId, bodyText) {
    return this.executeWithFallback(
      'GENERATE_SUBJECT',
      (provider) => provider.generateSubject(bodyText),
      userId,
      { emailText: bodyText }
    );
  }
}

module.exports = new AIService();
