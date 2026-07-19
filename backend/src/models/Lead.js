const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor', required: true, index: true },
    name: { type: String, required: true },
    phone: String,
    email: String,
    message: String,
    interest: String,
    status: { type: String, enum: ['new', 'follow-up', 'converted'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
