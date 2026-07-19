const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advisor',
      required: true,
      index: true
    },
    clientName: String,
    role: String,
    message: String,
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', testimonialSchema);
