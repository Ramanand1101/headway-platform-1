const express = require('express');
const multer = require('multer');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { listCreatives, uploadCreatives, deleteCreative } = require('../controllers/creativeController');

// Same per-file limit as the advisor content library uploader (uploaded one
// file per request from the admin UI, so a larger per-file size is fine) —
// also caps reel (video) uploads, since the hosting platform enforces a
// ~4.5MB request body limit regardless of file type.
const uploadPhotos = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(Object.assign(new Error('Files must be images or videos'), { status: 400 }));
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
