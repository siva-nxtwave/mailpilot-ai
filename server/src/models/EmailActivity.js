const mongoose = require('mongoose');

const emailActivitySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_REGISTERED',
        'USER_LOGGED_IN',
        'GMAIL_CONNECTED',
        'GMAIL_DISCONNECTED',
        'EMAIL_VIEWED',
        'EMAIL_SUMMARIZED',
        'REPLY_GENERATED',
        'REPLY_EDITED',
        'EMAIL_SENT',
        'EMAIL_ARCHIVED',
        'EMAIL_DELETED',
        'EMAIL_MARKED_READ',
        'EMAIL_MARKED_UNREAD',
        'EMAIL_STARRED',
        'EMAIL_UNSTARRED',
        'AI_OPERATION_COMPLETED',
        'AI_OPERATION_FAILED'
      ]
    },
    messageId: {
      type: String,
      trim: true
    },
    threadId: {
      type: String,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    success: {
      type: Boolean,
      default: true
    },
    error: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('EmailActivity', emailActivitySchema);
