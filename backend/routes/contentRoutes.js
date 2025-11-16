const express = require('express');
const router = express.Router();
const {
  createContent,
  readContent,
  getContent,
  deleteContent,
  downloadFile,
} = require('../controllers/contentController');
const { uploadContent } = require('../middleware/upload');

/**
 * Content Routes
 */

// POST /api/createContent - Create new content (returns 4-digit key)
router.post('/createContent', uploadContent, createContent);

// GET /api/getContent/:key - Get content by 4-digit key (main endpoint)
router.get('/getContent/:key', getContent);

// GET /api/readContent/:randomKey - Read content by key (legacy - supports old keys)
router.get('/readContent/:randomKey', readContent);

// GET /api/download/:fileId - Download/view file from GridFS
router.get('/download/:fileId', downloadFile);

// DELETE /api/delete/:key - Delete content by key (supports both 4-digit and legacy keys)
router.delete('/delete/:key', deleteContent);

module.exports = router;

