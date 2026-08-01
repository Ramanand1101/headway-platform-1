const express = require('express');
const router = express.Router();
const { postMessage } = require('../controllers/chatbotController');

// Public — used by anonymous microsite visitors as well as advisors.
router.post('/message', postMessage);

module.exports = router;
