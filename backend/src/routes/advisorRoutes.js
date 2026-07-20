const express = require('express');
const multer = require('multer');
const router = express.Router();
const resolveTenant = require('../middleware/resolveTenant');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const {
  getAdvisorProfile,
  getAdvisorTestimonials,
  listAdvisors,
  getAdvisorTemplate,
  bulkUploadAdvisors,
  onboardAdvisor,
  getMyProfile,
  updateAdvisorProfile,
  checkSlugAvailability,
  updateAdvisorSlug,
  uploadProfilePhoto,
  uploadMicrositeImage,
  deleteMicrositeImage,
  uploadContentLibraryImages,
  deleteContentLibraryImage,
  uploadListImage,
  getMyTestimonials,
  createMyTestimonial,
  updateMyTestimonial,
  deleteMyTestimonial,
  adminEnterAdvisor
} = require('../controllers/advisorController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

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

// Content library photos are uploaded one file per request (see the
// dashboard's sequential upload loop), so this can allow a larger per-file
// size than the other single-request uploaders while staying under the
// hosting platform's ~4.5MB request body limit.
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

// Public — resolves tenant from subdomain/custom domain
router.get('/profile', resolveTenant, getAdvisorProfile);
router.get('/testimonials', resolveTenant, getAdvisorTestimonials);

// Admin-only — list all advisors (for the admin panel)
router.get('/', authenticate, requireAdmin, listAdvisors);

// Admin-only — CSV template download + bulk upload
router.get('/template', authenticate, requireAdmin, getAdvisorTemplate);
router.post('/bulk', authenticate, requireAdmin, upload.single('file'), bulkUploadAdvisors);

// Admin-only — onboards a new advisor tenant
router.post('/onboard', authenticate, requireAdmin, onboardAdvisor);

// Verifies admin email+password fresh (independent of any session token)
// and, only if valid, mints a short-lived token to open an advisor's
// dashboard on their behalf, by slug, to edit their full website for them.
router.post('/:slug/admin-enter', adminEnterAdvisor);

// Protected — advisor views/edits their own profile from the dashboard
router.get('/me', authenticate, getMyProfile);
router.get('/slug-availability', authenticate, checkSlugAvailability);
router.patch('/slug', authenticate, updateAdvisorSlug);
router.patch('/profile', authenticate, updateAdvisorProfile);
router.post('/photo', authenticate, uploadPhoto.single('photo'), uploadProfilePhoto);
router.post(
  '/microsite-image/:section',
  authenticate,
  uploadPhoto.single('image'),
  uploadMicrositeImage
);
router.delete('/microsite-image/:section', authenticate, deleteMicrositeImage);
router.post(
  '/content-library',
  authenticate,
  uploadPhotos.array('images', 10),
  uploadContentLibraryImages
);
router.delete('/content-library', authenticate, deleteContentLibraryImage);
router.post('/list-image', authenticate, uploadPhoto.single('image'), uploadListImage);

router.get('/me/testimonials', authenticate, getMyTestimonials);
router.post('/me/testimonials', authenticate, createMyTestimonial);
router.patch('/me/testimonials/:id', authenticate, updateMyTestimonial);
router.delete('/me/testimonials/:id', authenticate, deleteMyTestimonial);

module.exports = router;
