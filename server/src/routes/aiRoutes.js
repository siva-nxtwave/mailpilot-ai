const express = require('express');
const { body } = require('express-validator');
const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { aiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.use(authenticate);
router.use(aiLimiter);

router.get('/status', aiController.getStatus);

router.post(
  '/summarize',
  [
    body('emailText').notEmpty().withMessage('emailText is required'),
    validate
  ],
  aiController.summarize
);

router.post(
  '/generate-reply',
  [
    body('threadText').notEmpty().withMessage('threadText is required'),
    validate
  ],
  aiController.generateReply
);

router.post(
  '/explain',
  [
    body('emailText').notEmpty().withMessage('emailText is required'),
    validate
  ],
  aiController.explain
);

router.post(
  '/action-items',
  [
    body('emailText').notEmpty().withMessage('emailText is required'),
    validate
  ],
  aiController.extractActionItems
);

router.post(
  '/extract-dates',
  [
    body('emailText').notEmpty().withMessage('emailText is required'),
    validate
  ],
  aiController.extractDates
);

router.post(
  '/rewrite',
  [
    body('text').notEmpty().withMessage('text is required'),
    validate
  ],
  aiController.rewrite
);

router.post(
  '/generate-subject',
  [
    body('bodyText').notEmpty().withMessage('bodyText is required'),
    validate
  ],
  aiController.generateSubject
);

module.exports = router;
