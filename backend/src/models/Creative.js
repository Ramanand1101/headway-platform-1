const mongoose = require('mongoose');

// Admin-curated marketing images shared with every advisor's Content
// Library, organized into a fixed set of insurance-line folders.
const CREATIVE_CATEGORIES = ['life', 'health', 'general'];

const creativeSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CREATIVE_CATEGORIES, required: true, index: true },
    imageUrl: { type: String, required: true },
    title: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Creative', creativeSchema);
module.exports.CREATIVE_CATEGORIES = CREATIVE_CATEGORIES;
