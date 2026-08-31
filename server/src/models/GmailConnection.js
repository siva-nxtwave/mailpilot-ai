const mongoose = require('mongoose');

const gmailConnectionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    provider: {
      type: String,
      default: 'gmail'
    },
    googleAccountEmail: {
      type: String,
      trim: true
    },
    isConnected: {
      type: Boolean,
      default: false
    },
    scopes: {
      type: [String],
      default: []
    },
    encryptedAccessToken: {
      type: String
    },
    encryptedRefreshToken: {
      type: String
    },
    expiresAt: {
      type: Date
    },
    connectedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('GmailConnection', gmailConnectionSchema);
