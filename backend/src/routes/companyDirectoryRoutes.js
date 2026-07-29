const express = require('express');
const multer = require('multer');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { listCompanies, createCompany, deleteCompany } = require('../controllers/companyDirectoryController');

const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('File must be an image'), { status: 400 }));
    }
    cb(null, true);
  }
});

router.get('/', authenticate, listCompanies);
router.post('/', authenticate, requireAdmin, uploadPhoto.single('logo'), createCompany);
router.delete('/:id', authenticate, requireAdmin, deleteCompany);

module.exports = router;
