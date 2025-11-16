const multer = require('multer');
const { validateFileSize, validateImageType, validateFileType } = require('../utils/fileValidator');

/**
 * Multer configuration using memory storage
 * Files are stored in memory before uploading to GridFS
 */
const storage = multer.memoryStorage();

/**
 * File filter for images
 */
const imageFilter = (req, file, cb) => {
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.valid) {
    return cb(new Error(sizeValidation.error), false);
  }

  const typeValidation = validateImageType(file.mimetype);
  if (!typeValidation.valid) {
    return cb(new Error(typeValidation.error), false);
  }

  cb(null, true);
};

/**
 * File filter for general files
 */
const fileFilter = (req, file, cb) => {
  // Note: file.size might not be available at this stage for some upload methods
  // We'll validate size in the controller after upload
  const typeValidation = validateFileType(file.mimetype);
  if (!typeValidation.valid) {
    return cb(new Error(typeValidation.error), false);
  }

  cb(null, true);
};

/**
 * Multer upload middleware for images
 */
const uploadImages = multer({
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).array('images', 20); // Allow up to 20 images

/**
 * Multer upload middleware for files
 */
const uploadFiles = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).array('files', 20); // Allow up to 20 files

/**
 * Combined upload middleware for both images and files
 * Uses fields to handle both image and file arrays
 */
const uploadContent = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    fieldSize: 50 * 1024 * 1024, // 50MB total field size
  },
}).fields([
  { name: 'images', maxCount: 20 },
  { name: 'files', maxCount: 20 },
]);

module.exports = {
  uploadImages,
  uploadFiles,
  uploadContent,
};

