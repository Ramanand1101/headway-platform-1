const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advisor',
      required: true,
      index: true
    },
    razorpaySubscriptionId: String,
    planAmount: Number,
    status: {
      type: String,
      enum: ['active', 'pending', 'failed', 'cancelled'],
      default: 'pending'
    },
    nextBillingDate: Date,
    lastPaymentDate: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model('Billing', billingSchema);
