const express = require('express');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { createHomepageLead, listHomepageLeads, updateHomepageLeadStatus } = require('../controllers/homepageLeadController');

const router = express.Router();

router.post('/', createHomepageLead);
router.get('/', authenticate, requireAdmin, listHomepageLeads);
router.patch('/:id/status', authenticate, requireAdmin, updateHomepageLeadStatus);

module.exports = router;
