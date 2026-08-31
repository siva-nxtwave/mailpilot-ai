const mongoose = require('mongoose');

const aiRequestSchema = new mongoose.Schema(
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
        'SUMMARIZE',
        'GENERATE_REPLY',
        'EXPLAIN',
        'ACTION_ITEMS',
        'EXTRACT_DATES',
        'REWRITE',
        'GENERATE_SUBJECT'
      ]
    },
    messageId: {
      type: String
    },
    threadId: {
      type: String
    },
    provider: {
      type: String,
      enum: ['openrouter', 'gemini', 'fallback'],
      required: true
    },
    model: {
      type: String
    },
    inputMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    success: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number // in milliseconds
    },
    error: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AIRequest', aiRequestSchema);
