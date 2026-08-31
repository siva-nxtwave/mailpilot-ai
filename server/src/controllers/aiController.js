const aiService = require('../services/aiService');

const summarize = async (req, res, next) => {
  try {
    const { emailText, subject, from, messageId, threadId } = req.body;
    const result = await aiService.summarize(req.user._id, emailText || '', {
      subject,
      from,
      messageId,
      threadId
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const generateReply = async (req, res, next) => {
  try {
    const { threadText, tone, customInstructions, sender, messageId, threadId } = req.body;
    const result = await aiService.generateReply(req.user._id, threadText || '', {
      tone: tone || 'professional',
      customInstructions,
      sender,
      messageId,
      threadId
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const explain = async (req, res, next) => {
  try {
    const { emailText, messageId, threadId } = req.body;
    const result = await aiService.explain(req.user._id, emailText || '', { messageId, threadId });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const extractActionItems = async (req, res, next) => {
  try {
    const { emailText, messageId, threadId } = req.body;
    const result = await aiService.extractActionItems(req.user._id, emailText || '', { messageId, threadId });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const extractDates = async (req, res, next) => {
  try {
    const { emailText, messageId, threadId } = req.body;
    const result = await aiService.extractDates(req.user._id, emailText || '', { messageId, threadId });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const rewrite = async (req, res, next) => {
  try {
    const { text, tone } = req.body;
    const result = await aiService.rewrite(req.user._id, text || '', tone || 'professional');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const generateSubject = async (req, res, next) => {
  try {
    const { bodyText } = req.body;
    const result = await aiService.generateSubject(req.user._id, bodyText || '');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const status = aiService.getProviderStatus();
    res.status(200).json({ success: true, data: status });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  summarize,
  generateReply,
  explain,
  extractActionItems,
  extractDates,
  rewrite,
  generateSubject,
  getStatus
};
