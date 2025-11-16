const mongoose = require('mongoose');

/**
 * ImageMeta Model
 * Stores metadata for uploaded images in GridFS
 */
const imageMetaSchema = new mongoose.Schema({
  imageName: {
    type: String,
    required: true,
  },
  imageType: {
    type: String,
    required: true, // MIME type (e.g., image/jpeg, image/png)
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
imageMetaSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ImageMeta', imageMetaSchema);

