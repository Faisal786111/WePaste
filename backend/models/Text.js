const mongoose = require('mongoose');

/**
 * Text Model
 * Stores text content with expiration time (2 hours)
 */
const textSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiredAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index for auto-deletion
  },
});

// Create TTL index on expiredAt
textSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Text', textSchema);

