const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const { watermark, download, personalize } = require('../controllers/mediaController');

// Public — these render straight into <img>/<a href> tags across the
// dashboard and public microsites, same trust model as the raw S3 URLs
// (which are already public-read) and Cloudinary's transform URLs before.
router.get('/watermark', watermark);
router.get('/download', download);

// Authenticated — stamps the *logged-in* advisor's own name/phone onto a
// creative, so it must know who's asking.
router.get('/personalize', authenticate, personalize);

module.exports = router;
