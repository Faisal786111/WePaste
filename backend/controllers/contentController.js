const Text = require('../models/Text');
const ImageMeta = require('../models/ImageMeta');
const FileMeta = require('../models/FileMeta');
const RandomKeys = require('../models/RandomKeys');
const { uploadToGridFS, deleteFromGridFS, getGridFSFileStream } = require('../utils/gridfs');
const { generateUnique4DigitKey } = require('../utils/keyGenerator');
const { validateFileSize, validateImageType, validateFileType } = require('../utils/fileValidator');

/**
 * Calculate expiration time (2 hours from now)
 */
const getExpirationTime = () => {
  const now = new Date();
  const expireAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours
  return expireAt;
};

/**
 * Check if content is expired
 */
const isExpired = (expiredAt) => {
  return new Date() > new Date(expiredAt);
};

/**
 * POST /api/createContent
 * Create new content (text, images, files) and generate random key
 */
const createContent = async (req, res, next) => {
  try {
    const { text } = req.body;
    const images = req.files?.images || [];
    const files = req.files?.files || [];
    const expireAt = getExpirationTime();

    // Validate at least one content type is provided
    if (!text && images.length === 0 && files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least text, images, or files',
      });
    }

    // Validate file sizes
    const allFiles = [...images, ...files];
    for (const file of allFiles) {
      const sizeValidation = validateFileSize(file.size);
      if (!sizeValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `${file.originalname}: ${sizeValidation.error}`,
        });
      }
    }

    // Validate image types
    for (const image of images) {
      const typeValidation = validateImageType(image.mimetype);
      if (!typeValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `${image.originalname}: ${typeValidation.error}`,
        });
      }
    }

    // Validate file types
    for (const file of files) {
      const typeValidation = validateFileType(file.mimetype);
      if (!typeValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `${file.originalname}: ${typeValidation.error}`,
        });
      }
    }

    // Generate guaranteed unique 4-digit key (0000-9999)
    let randomKey;
    try {
      randomKey = await generateUnique4DigitKey();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate unique 4-digit key. Please try again.',
      });
    }

    const createdItems = [];

    // Save text if provided
    if (text && text.trim()) {
      const textDoc = await Text.create({
        content: text,
        expiredAt: expireAt,
      });
      createdItems.push({ type: 'text', id: textDoc._id });
    }

    // Upload images to GridFS and save metadata
    for (const image of images) {
      try {
        const fileId = await uploadToGridFS(image.buffer, image.originalname, image.mimetype);
        const imageMeta = await ImageMeta.create({
          imageName: image.originalname,
          imageType: image.mimetype,
          fileId: fileId,
          expiredAt: expireAt,
        });
        createdItems.push({ type: 'image', id: imageMeta._id });
      } catch (error) {
        console.error(`Error uploading image ${image.originalname}:`, error);
        // Continue with other files
      }
    }

    // Upload files to GridFS and save metadata
    for (const file of files) {
      try {
        const fileId = await uploadToGridFS(file.buffer, file.originalname, file.mimetype);
        const fileMeta = await FileMeta.create({
          fileName: file.originalname,
          fileType: file.mimetype,
          fileId: fileId,
          expiredAt: expireAt,
        });
        createdItems.push({ type: 'file', id: fileMeta._id });
      } catch (error) {
        console.error(`Error uploading file ${file.originalname}:`, error);
        // Continue with other files
      }
    }

    // Create random key mappings
    for (const item of createdItems) {
      await RandomKeys.create({
        key: randomKey,
        type: item.type,
        referenceObjectId: item.id,
        expiredAt: expireAt,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        randomKey,
        expireIn: '2 hours',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to get full URL for file
 */
const getFileUrl = (req, fileId) => {
  const protocol = req.protocol;
  const host = req.get('host');
  return `${protocol}://${host}/api/download/${fileId}`;
};

/**
 * GET /api/readContent/:randomKey
 * Retrieve content by random key (legacy endpoint)
 */
const readContent = async (req, res, next) => {
  try {
    const { randomKey } = req.params;

    if (!randomKey) {
      return res.status(400).json({
        success: false,
        error: 'Random key is required',
      });
    }

    // Find all entries for this key
    const keyEntries = await RandomKeys.find({ key: randomKey });

    if (!keyEntries || keyEntries.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found or expired',
      });
    }

    // Check if expired
    const firstEntry = keyEntries[0];
    if (isExpired(firstEntry.expiredAt)) {
      return res.status(410).json({
        success: false,
        error: 'Content has expired',
      });
    }

    const responseData = {
      text: null,
      images: [],
      files: [],
    };

    // Fetch text, images, and files
    for (const entry of keyEntries) {
      if (entry.type === 'text') {
        const textDoc = await Text.findById(entry.referenceObjectId);
        if (textDoc && !isExpired(textDoc.expiredAt)) {
          responseData.text = textDoc.content;
        }
      } else if (entry.type === 'image') {
        const imageMeta = await ImageMeta.findById(entry.referenceObjectId);
        if (imageMeta && !isExpired(imageMeta.expiredAt)) {
          responseData.images.push({
            id: imageMeta.fileId.toString(),
            name: imageMeta.imageName,
            type: imageMeta.imageType,
            url: getFileUrl(req, imageMeta.fileId), // Full URL
          });
        }
      } else if (entry.type === 'file') {
        const fileMeta = await FileMeta.findById(entry.referenceObjectId);
        if (fileMeta && !isExpired(fileMeta.expiredAt)) {
          responseData.files.push({
            id: fileMeta.fileId.toString(),
            name: fileMeta.fileName,
            type: fileMeta.fileType,
            url: getFileUrl(req, fileMeta.fileId), // Full URL
          });
        }
      }
    }

    // Check if any content was found
    if (!responseData.text && responseData.images.length === 0 && responseData.files.length === 0) {
      return res.status(410).json({
        success: false,
        error: 'Content has expired',
      });
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/getContent/:key
 * Get content by 4-digit key - Returns formatted response with key, type, content, fileUrl
 */
const getContent = async (req, res, next) => {
  try {
    let { key } = req.params;

    // Validate key exists
    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Key is required',
      });
    }

    // Normalize 4-digit key - ensure it's 4 digits with leading zeros
    key = key.trim();
    
    // Validate 4-digit format
    if (!/^\d{1,4}$/.test(key)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid key format. Key must be 1-4 digits (0000-9999)',
      });
    }

    // Pad with leading zeros to ensure 4 digits
    key = key.padStart(4, '0');

    // Find all entries for this key
    const keyEntries = await RandomKeys.find({ key: key });

    if (!keyEntries || keyEntries.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found or expired',
      });
    }

    // Check if expired
    const firstEntry = keyEntries[0];
    if (isExpired(firstEntry.expiredAt)) {
      return res.status(410).json({
        success: false,
        error: 'Content has expired',
      });
    }

    const responseData = {
      key: key, // Return normalized 4-digit key
      type: [],
      content: {
        text: null,
        images: [],
        files: [],
      },
    };

    // Fetch text, images, and files
    for (const entry of keyEntries) {
      if (entry.type === 'text') {
        const textDoc = await Text.findById(entry.referenceObjectId);
        if (textDoc && !isExpired(textDoc.expiredAt)) {
          if (!responseData.type.includes('text')) {
            responseData.type.push('text');
          }
          responseData.content.text = textDoc.content;
        }
      } else if (entry.type === 'image') {
        const imageMeta = await ImageMeta.findById(entry.referenceObjectId);
        if (imageMeta && !isExpired(imageMeta.expiredAt)) {
          if (!responseData.type.includes('image')) {
            responseData.type.push('image');
          }
          responseData.content.images.push({
            id: imageMeta.fileId.toString(),
            name: imageMeta.imageName,
            type: imageMeta.imageType,
            fileUrl: getFileUrl(req, imageMeta.fileId), // Full URL
          });
        }
      } else if (entry.type === 'file') {
        const fileMeta = await FileMeta.findById(entry.referenceObjectId);
        if (fileMeta && !isExpired(fileMeta.expiredAt)) {
          if (!responseData.type.includes('file')) {
            responseData.type.push('file');
          }
          responseData.content.files.push({
            id: fileMeta.fileId.toString(),
            name: fileMeta.fileName,
            type: fileMeta.fileType,
            fileUrl: getFileUrl(req, fileMeta.fileId), // Full URL
          });
        }
      }
    }

    // Check if any content was found
    if (!responseData.content.text && responseData.content.images.length === 0 && responseData.content.files.length === 0) {
      return res.status(410).json({
        success: false,
        error: 'Content has expired',
      });
    }

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/download/:fileId
 * Download/view file from GridFS
 */
const downloadFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'File ID is required',
      });
    }

    // Get file metadata to set proper headers
    const bucket = require('../config/database').getGridFSBucket();
    const mongoose = require('mongoose');
    
    let files;
    try {
      files = await bucket.find({ _id: new mongoose.Types.ObjectId(fileId) }).toArray();
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file ID format',
      });
    }

    if (files.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    const file = files[0];
    
    // Set CORS headers for file serving
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Content-Type', file.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', file.length);
    
    // Set Content-Disposition for inline viewing (images) or download (files)
    const isImage = file.contentType && file.contentType.startsWith('image/');
    if (isImage) {
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    }

    // Get file stream
    const stream = getGridFSFileStream(fileId);

    stream.on('error', (error) => {
      if (error.code === 'ENOENT' || error.code === 'ENOTFOUND') {
        return res.status(404).json({
          success: false,
          error: 'File not found',
        });
      }
      console.error('Error streaming file:', error);
      if (!res.headersSent) {
        next(error);
      }
    });

    stream.pipe(res);
  } catch (error) {
    console.error('Error in downloadFile:', error);
    next(error);
  }
};

/**
 * DELETE /api/delete/:key
 * Delete content by key (supports both 4-digit and legacy keys)
 * Only valid within 2 hours
 */
const deleteContent = async (req, res, next) => {
  try {
    let { key } = req.params;

    if (!key) {
      return res.status(400).json({
        success: false,
        error: 'Key is required',
      });
    }

    // Normalize key - if it's a 4-digit number, pad with leading zeros
    key = key.trim();
    if (/^\d{1,4}$/.test(key)) {
      key = key.padStart(4, '0');
    }

    // Find all entries for this key
    const keyEntries = await RandomKeys.find({ key: key });

    if (!keyEntries || keyEntries.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Content not found',
      });
    }

    // Check if expired (cannot delete after 2 hours)
    const firstEntry = keyEntries[0];
    if (isExpired(firstEntry.expiredAt)) {
      return res.status(403).json({
        success: false,
        error: 'Content has expired. Deletion not allowed after expiration.',
      });
    }

    // Delete text, images, files, and GridFS files
    for (const entry of keyEntries) {
      if (entry.type === 'text') {
        const textDoc = await Text.findById(entry.referenceObjectId);
        if (textDoc) {
          await Text.findByIdAndDelete(textDoc._id);
        }
      } else if (entry.type === 'image') {
        const imageMeta = await ImageMeta.findById(entry.referenceObjectId);
        if (imageMeta) {
          await deleteFromGridFS(imageMeta.fileId);
          await ImageMeta.findByIdAndDelete(imageMeta._id);
        }
      } else if (entry.type === 'file') {
        const fileMeta = await FileMeta.findById(entry.referenceObjectId);
        if (fileMeta) {
          await deleteFromGridFS(fileMeta.fileId);
          await FileMeta.findByIdAndDelete(fileMeta._id);
        }
      }
    }

    // Delete all random key entries
    await RandomKeys.deleteMany({ key: randomKey });

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContent,
  readContent,
  getContent,
  deleteContent,
  downloadFile,
};

