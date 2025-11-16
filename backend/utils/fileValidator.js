/**
 * File validation utilities
 */

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// Maximum file size: 10MB in bytes
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file size
 * @param {Number} size - File size in bytes
 * @returns {Object} { valid: Boolean, error: String }
 */
const validateFileSize = (size) => {
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`,
    };
  }
  return { valid: true };
};

/**
 * Validate image MIME type
 * @param {String} mimetype - MIME type
 * @returns {Object} { valid: Boolean, error: String }
 */
const validateImageType = (mimetype) => {
  if (!ALLOWED_IMAGE_TYPES.includes(mimetype.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid image type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }
  return { valid: true };
};

/**
 * Validate file (general files)
 * @param {String} mimetype - MIME type
 * @returns {Object} { valid: Boolean, error: String }
 */
const validateFileType = (mimetype) => {
  // For general files, we accept most MIME types
  // Block executable files for security
  const BLOCKED_TYPES = [
    'application/x-msdownload', // .exe
    'application/x-executable',
    'application/x-sh',
    'application/x-shellscript',
  ];

  if (BLOCKED_TYPES.includes(mimetype.toLowerCase())) {
    return {
      valid: false,
      error: 'Executable files are not allowed',
    };
  }
  return { valid: true };
};

module.exports = {
  validateFileSize,
  validateImageType,
  validateFileType,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
};

