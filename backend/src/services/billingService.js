// Wraps Razorpay subscription creation.
// Install the official SDK in production: npm install razorpay
// const Razorpay = require('razorpay');
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET
// });

async function createSubscription(advisorId, planAmount) {
  // Example shape — replace with a real razorpay.subscriptions.create() call
  return {
    id: `sub_${advisorId}_${Date.now()}`,
    amount: planAmount,
    status: 'created'
  };
}

module.exports = { createSubscription };
