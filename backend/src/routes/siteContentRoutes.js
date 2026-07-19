const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { getContent, updateContent } = require('../controllers/siteContentController');

const router = express.Router();

router.get('/:page', getContent);
router.put('/:page', authenticate, requireAdmin, updateContent);

module.exports = router;
