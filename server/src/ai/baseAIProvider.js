class BaseAIProvider {
  constructor(name) {
    this.name = name;
  }

  isAvailable() {
    throw new Error('Method isAvailable() must be implemented');
  }

  summarize(emailText, context) {
    throw new Error('Method summarize() must be implemented');
  }

  generateReply(threadText, options) {
    throw new Error('Method generateReply() must be implemented');
  }

  explain(emailText) {
    throw new Error('Method explain() must be implemented');
  }

  extractActionItems(emailText) {
    throw new Error('Method extractActionItems() must be implemented');
  }

  extractDates(emailText) {
    throw new Error('Method extractDates() must be implemented');
  }

  rewrite(text, tone) {
    throw new Error('Method rewrite() must be implemented');
  }

  generateSubject(bodyText) {
    throw new Error('Method generateSubject() must be implemented');
  }
}

module.exports = BaseAIProvider;
