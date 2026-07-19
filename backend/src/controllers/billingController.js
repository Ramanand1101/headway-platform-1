const Billing = require('../models/Billing');
const { createSubscription } = require('../services/billingService');

// POST /api/billing/subscribe
exports.subscribeAdvisor = async (req, res, next) => {
  try {
    const { advisorId, planAmount } = req.body;
    const subscription = await createSubscription(advisorId, planAmount);

    const billing = await Billing.create({
      advisorId,
      razorpaySubscriptionId: subscription.id,
      planAmount,
      status: 'pending'
    });

    res.status(201).json({ billing });
  } catch (err) {
    next(err);
  }
};

// GET /api/billing/status
exports.getBillingStatus = async (req, res, next) => {
  try {
    const billing = await Billing.findOne({ advisorId: req.user.advisorId });
    res.json({ billing });
  } catch (err) {
    next(err);
  }
};

// POST /api/billing/webhook  (Razorpay webhook receiver)
exports.handleWebhook = async (req, res, next) => {
  try {
    const { subscriptionId, status, paidAt } = req.body;

    await Billing.findOneAndUpdate(
      { razorpaySubscriptionId: subscriptionId },
      { status, lastPaymentDate: paidAt }
    );

    res.status(200).json({ received: true });
  } catch (err) {
    next(err);
  }
};
