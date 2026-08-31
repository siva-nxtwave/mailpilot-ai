const gmailService = require('../services/gmailService');

const getEmails = async (req, res, next) => {
  try {
    const { folder, q, maxResults, pageToken } = req.query;
    const result = await gmailService.getMessages(req.user._id, {
      folder: folder || 'INBOX',
      q,
      maxResults: parseInt(maxResults, 10) || 25,
      pageToken
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getEmailById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const email = await gmailService.getMessage(req.user._id, id);
    res.status(200).json({
      success: true,
      data: email
    });
  } catch (error) {
    next(error);
  }
};

const getThreadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const thread = await gmailService.getThread(req.user._id, id);
    res.status(200).json({
      success: true,
      data: thread
    });
  } catch (error) {
    next(error);
  }
};

const searchEmails = async (req, res, next) => {
  try {
    const { q, maxResults, pageToken } = req.query;
    const result = await gmailService.searchMessages(req.user._id, q || '', {
      maxResults: parseInt(maxResults, 10) || 25,
      pageToken
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gmailService.markAsRead(req.user._id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const markAsUnread = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gmailService.markAsUnread(req.user._id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const starEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gmailService.starMessage(req.user._id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const unstarEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gmailService.unstarMessage(req.user._id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const archiveEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gmailService.archiveMessage(req.user._id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const trashEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await gmailService.trashMessage(req.user._id, id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const bulkOperation = (action) => async (req, res, next) => {
  try {
    const { ids } = req.body;
    const result = await gmailService.bulkModify(req.user._id, ids || [], action);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const sendEmail = async (req, res, next) => {
  try {
    const { to, cc, bcc, subject, body, threadId } = req.body;
    const result = await gmailService.sendEmail(req.user._id, {
      to,
      cc,
      bcc,
      subject,
      body,
      threadId
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const replyToEmail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { body, tone } = req.body;
    const result = await gmailService.replyToEmail(req.user._id, id, body, tone);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmails,
  getEmailById,
  getThreadById,
  searchEmails,
  markAsRead,
  markAsUnread,
  starEmail,
  unstarEmail,
  archiveEmail,
  trashEmail,
  bulkOperation,
  sendEmail,
  replyToEmail
};
