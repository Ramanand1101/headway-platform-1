const express = require('express');
const multer = require('multer');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { getBanners, uploadBanner } = require('../controllers/siteBannerController');

const router = express.Router();

const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('File must be an image'), { status: 400 }));
    }
    cb(null, true);
  }
});

router.get('/', getBanners);
router.post('/:key', authenticate, requireAdmin, uploadImage.single('image'), uploadBanner);

module.exports = router;
