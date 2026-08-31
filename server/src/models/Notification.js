const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: [
        'GMAIL_CONNECTED',
        'GMAIL_EXPIRED',
        'EMAIL_SENT',
        'AI_COMPLETED',
        'AI_FAILED',
        'GMAIL_ERROR',
        'AUTH_EXPIRED',
        'SYSTEM_INFO'
      ]
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    messageId: {
      type: String
    },
    threadId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
