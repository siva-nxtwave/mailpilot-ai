const express = require('express');
const integrationController = require('../controllers/integrationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/gmail/status', authenticate, integrationController.getGmailStatus);
router.get('/gmail/oauth/start', authenticate, integrationController.startGmailOAuth);
router.get('/gmail/oauth/callback', integrationController.handleGmailCallback);
router.post('/gmail/disconnect', authenticate, integrationController.disconnectGmail);

module.exports = router;
