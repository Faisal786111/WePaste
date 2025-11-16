const mongoose = require('mongoose');

/**
 * FileMeta Model
 * Stores metadata for uploaded files in GridFS
 */
const fileMetaSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  fileType: {
    type: String,
    required: true, // MIME type
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'uploads.chunks', // Reference to GridFS file
  },
  uploadedAt: {
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
fileMetaSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('FileMeta', fileMetaSchema);

