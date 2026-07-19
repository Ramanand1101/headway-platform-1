const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const {
  createCustomer,
  loginCustomer,
  getMyCustomerProfile
} = require('../controllers/customerController');

// Public — customer sign up / log in
router.post('/', createCustomer);
router.post('/login', loginCustomer);

// Protected — logged-in customer's own info
router.get('/me', authenticate, getMyCustomerProfile);

module.exports = router;
