const express = require('express');
const path = require('path');
const sharp = require('sharp');
const upload = require('../middleware/storageConfig');

const router = express.Router();

router.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    console.error(`[UPLOAD ERROR] No file uploaded at ${new Date().toISOString()}`);
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const originalPath = req.file.path;
  const filename = req.file.filename;
  const ext = path.extname(filename);
  const nameWithoutExt = path.basename(filename, ext);
  const thumbFilename = `${nameWithoutExt}-thumb${ext}`;
  const thumbPath = path.join(__dirname, '..', 'public/images', thumbFilename);

  try {
    await sharp(originalPath).resize({ width: 300 }).toFile(thumbPath);

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    res.status(200).json({
      image: `${baseUrl}/api/images/${filename}`,
      thumbnail: `${baseUrl}/api/images/${thumbFilename}`
    });
  } catch (err) {
    console.error(`[UPLOAD ERROR] Failed to process thumbnail:`, err);
    res.status(500).json({ error: 'Image processing failed' });
  }
});

router.get('/images/:filename', (req, res) => {
  const filepath = path.join(__dirname, '..', 'public/images', req.params.filename);
  res.sendFile(filepath);
});

module.exports = router;
