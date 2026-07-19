const express = require('express');
const router = express.Router();
const resolveTenant = require('../middleware/resolveTenant');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const {
  getPublishedContent,
  getPublishedPost,
  getPendingContent,
  listAllForAdvisor,
  approveContent,
  generateForAdvisor,
  draftForAdvisor,
  createManualPost,
  deletePost,
  getMyPosts,
  generateMyContent,
  draftMyContent,
  createMyManualPost,
  deleteMyPost
} = require('../controllers/contentController');

// Public — published blog posts for the tenant site
router.get('/', resolveTenant, getPublishedContent);
router.get('/post/:slug', resolveTenant, getPublishedPost);

// Protected — advisor's review dashboard
router.get('/pending', authenticate, getPendingContent);
router.patch('/:id/approve', authenticate, approveContent);

// Protected — advisor manages their own blog (self-service, credit-limited AI use)
router.get('/mine', authenticate, getMyPosts);
router.post('/mine/generate', authenticate, generateMyContent);
router.post('/mine/draft', authenticate, draftMyContent);
router.post('/mine/manual', authenticate, createMyManualPost);
router.delete('/mine/:id', authenticate, deleteMyPost);

// Admin-only — content generation and management for any advisor
router.get('/all/:advisorId', authenticate, requireAdmin, listAllForAdvisor);
router.post('/generate/:advisorId', authenticate, requireAdmin, generateForAdvisor);
router.post('/draft/:advisorId', authenticate, requireAdmin, draftForAdvisor);
router.post('/manual/:advisorId', authenticate, requireAdmin, createManualPost);
router.delete('/:id', authenticate, requireAdmin, deletePost);

module.exports = router;
