const gmailService = require('../services/gmailService');
const config = require('../config/env');

const getGmailStatus = async (req, res, next) => {
  try {
    const status = await gmailService.getConnectionStatus(req.user._id);
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    next(error);
  }
};

const startGmailOAuth = async (req, res, next) => {
  try {
    const url = gmailService.getOAuthUrl(req.user?._id || req.user?.id);
    res.status(200).json({
      success: true,
      data: { url }
    });
  } catch (error) {
    next(error);
  }
};

const handleGmailCallback = async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.redirect(`${config.CLIENT_URL}/integrations?error=missing_code`);
    }

    // In OAuth callback via browser redirect, req.user might be in session or passed in state
    // If state contains userId (or if user is authenticated)
    const userId = req.user ? req.user._id : state;

    if (!userId) {
      return res.redirect(`${config.CLIENT_URL}/integrations?error=missing_user`);
    }

    await gmailService.handleOAuthCallback(userId, code);
    return res.redirect(`${config.CLIENT_URL}/integrations?success=gmail_connected`);
  } catch (error) {
    console.error('Gmail OAuth Callback Error:', error.message);
    return res.redirect(`${config.CLIENT_URL}/integrations?error=${encodeURIComponent(error.message)}`);
  }
};

const disconnectGmail = async (req, res, next) => {
  try {
    const result = await gmailService.disconnect(req.user._id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGmailStatus,
  startGmailOAuth,
  handleGmailCallback,
  disconnectGmail
};
