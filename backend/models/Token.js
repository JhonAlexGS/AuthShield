const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['access', 'refresh'],
    required: true
  },
  blacklisted: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Auto-delete after 7 days
  }
});

// Index for faster queries
tokenSchema.index({ token: 1 });
tokenSchema.index({ userId: 1 });
tokenSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('Token', tokenSchema);
