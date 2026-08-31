const express = require('express');
const { body } = require('express-validator');
const emailController = require('../controllers/emailController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.use(authenticate);

// List and search
router.get('/', emailController.getEmails);
router.get('/search', emailController.searchEmails);
router.get('/:id', emailController.getEmailById);
router.get('/:id/thread', emailController.getThreadById);

// Single message mutations
router.post('/:id/read', emailController.markAsRead);
router.post('/:id/unread', emailController.markAsUnread);
router.post('/:id/star', emailController.starEmail);
router.post('/:id/unstar', emailController.unstarEmail);
router.post('/:id/archive', emailController.archiveEmail);
router.post('/:id/trash', emailController.trashEmail);

// Bulk message mutations
router.post('/bulk/read', emailController.bulkOperation('read'));
router.post('/bulk/unread', emailController.bulkOperation('unread'));
router.post('/bulk/star', emailController.bulkOperation('star'));
router.post('/bulk/archive', emailController.bulkOperation('archive'));
router.post('/bulk/trash', emailController.bulkOperation('trash'));

// Sending & Replying
router.post(
  '/send',
  [
    body('to').notEmpty().withMessage('Recipient (to) is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    validate
  ],
  emailController.sendEmail
);

router.post(
  '/:id/reply',
  [
    body('body').notEmpty().withMessage('Reply body is required'),
    validate
  ],
  emailController.replyToEmail
);

module.exports = router;
