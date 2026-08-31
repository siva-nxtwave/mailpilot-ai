/**
 * Abstract Base Integration Class for Email Providers
 */
class BaseIntegration {
  constructor() {
    if (this.constructor === BaseIntegration) {
      throw new Error('BaseIntegration is an abstract class and cannot be instantiated directly.');
    }
  }

  getAuthorizationUrl() {
    throw new Error('Method getAuthorizationUrl() must be implemented.');
  }

  handleOAuthCallback(code) {
    throw new Error('Method handleOAuthCallback() must be implemented.');
  }

  getConnectionStatus() {
    throw new Error('Method getConnectionStatus() must be implemented.');
  }

  getMessages(options) {
    throw new Error('Method getMessages() must be implemented.');
  }

  getMessage(messageId) {
    throw new Error('Method getMessage() must be implemented.');
  }

  getThread(threadId) {
    throw new Error('Method getThread() must be implemented.');
  }

  searchMessages(query, options) {
    throw new Error('Method searchMessages() must be implemented.');
  }

  modifyMessage(messageId, changes) {
    throw new Error('Method modifyMessage() must be implemented.');
  }

  modifyThread(threadId, changes) {
    throw new Error('Method modifyThread() must be implemented.');
  }

  sendMessage(message) {
    throw new Error('Method sendMessage() must be implemented.');
  }

  replyToMessage(messageId, body) {
    throw new Error('Method replyToMessage() must be implemented.');
  }

  disconnect() {
    throw new Error('Method disconnect() must be implemented.');
  }
}

module.exports = BaseIntegration;
