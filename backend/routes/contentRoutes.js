const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getGridFSBucket } = require('../config/database');
const {
  createContent,
  readContent,
  getContent,
  deleteContent,
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

router.get('/download/:id', async (req, res) => {
  try {
    // CORS headers for streamed response
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const gridFsBucket = getGridFSBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = gridFsBucket.openDownloadStream(fileId);

    downloadStream.on('file', (file) => {
      res.set({
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${file.filename}"`,
      });
    });

    downloadStream.on('error', () => {
      res.status(404).json({ message: 'File not found' });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Download Error:', error);
    res.status(500).json({ message: 'Error while downloading file' });
  }
});

// DELETE /api/delete/:key - Delete content by key (supports both 4-digit and legacy keys)
router.delete('/delete/:key', deleteContent);

module.exports = router;

