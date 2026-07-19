const express = require('express');
const authenticate = require('../middleware/authenticate');
const { createLead, getMyLeads, updateLeadStatus } = require('../controllers/leadController');

const router = express.Router();

router.post('/', createLead);
router.get('/mine', authenticate, getMyLeads);
router.patch('/:id/status', authenticate, updateLeadStatus);

module.exports = router;
