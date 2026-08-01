const mongoose = require('mongoose');

// Admin-curated marketing content shared with every advisor's Content
// Library, organized into a fixed set of insurance-line folders (category)
// and a content-format folder (type) — see backend/src/config/pricing.js
// for what each type costs an advisor to unlock/share/download.
const CREATIVE_CATEGORIES = ['life', 'health', 'general'];
const CREATIVE_TYPES = ['image', 'carousel', 'reel'];

const creativeSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CREATIVE_CATEGORIES, required: true, index: true },
    // Defaulted (not required) so documents created before this field
    // existed keep loading as plain images with no migration needed.
    type: { type: String, enum: CREATIVE_TYPES, default: 'image', index: true },
    // Holds the image URL for 'image'/'carousel' creatives, or the video
    // URL for 'reel' creatives — one field either way since only one is
    // ever a still frame's worth of content per creative today.
    imageUrl: { type: String, required: true },
    title: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Creative', creativeSchema);
module.exports.CREATIVE_CATEGORIES = CREATIVE_CATEGORIES;
module.exports.CREATIVE_TYPES = CREATIVE_TYPES;
