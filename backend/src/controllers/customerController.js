const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

// POST /api/customers (signup)
exports.createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const existing = await Customer.findOne({ email: email.trim() });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      name: name.trim(),
      email: email.trim(),
      phone: phone?.trim(),
      passwordHash
    });

    const token = jwt.sign(
      { customerId: customer._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      customer: { name: customer.name, email: customer.email, phone: customer.phone }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/customers/login
exports.loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, customer.passwordHash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { customerId: customer._id, role: 'customer' },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      customer: { name: customer.name, email: customer.email, phone: customer.phone }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/customers/me
exports.getMyCustomerProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.customerId).select('name email phone');
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ customer });
  } catch (err) {
    next(err);
  }
};
