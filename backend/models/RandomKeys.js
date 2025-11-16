const mongoose = require('mongoose');

/**
 * RandomKeys Model
 * Maps random keys to content (text, images, files)
 * Supports one key mapping to multiple content items
 */
const randomKeysSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file'],
    required: true,
  },
  referenceObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  expiredAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // TTL index for auto-deletion
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create TTL index on expiredAt
randomKeysSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
// Create index on key for faster lookups
randomKeysSchema.index({ key: 1 });

module.exports = mongoose.model('RandomKeys', randomKeysSchema);

