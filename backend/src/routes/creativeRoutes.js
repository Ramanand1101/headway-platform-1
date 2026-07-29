const express = require('express');
const multer = require('multer');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { listCreatives, uploadCreatives, deleteCreative } = require('../controllers/creativeController');

// Same per-file limit as the advisor content library uploader (uploaded one
// file per request from the admin UI, so a larger per-file size is fine).
const uploadPhotos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('Files must be images'), { status: 400 }));
    }
    cb(null, true);
  }
});

// Any logged-in advisor (or admin) can browse the shared library.
router.get('/', authenticate, listCreatives);

// Only admins manage what's in it.
router.post('/', authenticate, requireAdmin, uploadPhotos.array('images', 10), uploadCreatives);
router.delete('/:id', authenticate, requireAdmin, deleteCreative);

module.exports = router;
