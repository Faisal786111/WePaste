const { getGridFSBucket } = require('../config/database');
const mongoose = require('mongoose');

/**
 * Upload file to GridFS
 * @param {Buffer} fileBuffer - File buffer from Multer
 * @param {String} filename - Original filename
 * @param {String} mimetype - MIME type
 * @returns {Promise<ObjectId>} GridFS file ID
 */
const uploadToGridFS = async (fileBuffer, filename, mimetype) => {
  const bucket = getGridFSBucket();
  const uploadStream = bucket.openUploadStream(filename, {
    contentType: mimetype,
  });

  return new Promise((resolve, reject) => {
    uploadStream.on('error', reject);
    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<void>}
 */
const deleteFromGridFS = async (fileId) => {
  try {
    const bucket = getGridFSBucket();
    await bucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    // File might already be deleted or not exist
    console.error(`Error deleting GridFS file ${fileId}:`, error.message);
  }
};

/**
 * Get file download URL/stream
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {ReadableStream} GridFS download stream
 */
const getGridFSFileStream = (fileId) => {
  const bucket = getGridFSBucket();
  return bucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
};

/**
 * Check if file exists in GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<Boolean>}
 */
const fileExistsInGridFS = async (fileId) => {
  try {
    const bucket = getGridFSBucket();
    const files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    return files.length > 0;
  } catch (error) {
    return false;
  }
};

module.exports = {
  uploadToGridFS,
  deleteFromGridFS,
  getGridFSFileStream,
  fileExistsInGridFS,
};

