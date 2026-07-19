const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  subscribeAdvisor,
  getBillingStatus,
  handleWebhook
} = require('../controllers/billingController');

router.post('/subscribe', authenticate, subscribeAdvisor);
router.get('/status', authenticate, getBillingStatus);

// Razorpay calls this directly — no auth middleware, verify signature instead in production
router.post('/webhook', handleWebhook);

module.exports = router;
