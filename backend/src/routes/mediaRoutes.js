const express = require('express');
const router = express.Router();
const { watermark, download } = require('../controllers/mediaController');

// Public — these render straight into <img>/<a href> tags across the
// dashboard and public microsites, same trust model as the raw S3 URLs
// (which are already public-read) and Cloudinary's transform URLs before.
router.get('/watermark', watermark);
router.get('/download', download);

module.exports = router;
