const mongoose = require('mongoose');

// Admin-curated marketing content shared with every advisor's Content
// Library, organized into a fixed set of insurance-line folders (category)
// and a content-format folder (type) — see backend/src/config/pricing.js
// for what each type costs an advisor to unlock/share/download.
const CREATIVE_CATEGORIES = ['life', 'health', 'general'];
const CREATIVE_TYPES = ['image', 'carousel', 'reel'];
// `type` is the content *category* (drives the credit cost — see
// config/pricing.js); `format` is the actual file kind, which now varies
// within a type — a carousel can be a plain image or a swipeable PDF, so
// rendering/processing logic (watermark, thumbnail, <img> vs <video> vs a
// PDF card) needs this separate from `type`.
const CREATIVE_FORMATS = ['image', 'video', 'pdf'];

const creativeSchema = new mongoose.Schema(
  {
    category: { type: String, enum: CREATIVE_CATEGORIES, required: true, index: true },
    // Defaulted (not required) so documents created before this field
    // existed keep loading as plain images with no migration needed.
    type: { type: String, enum: CREATIVE_TYPES, default: 'image', index: true },
    // Defaulted for the same reason as `type` — existing documents predate
    // this field and were always plain images.
    format: { type: String, enum: CREATIVE_FORMATS, default: 'image' },
    // Holds the image/PDF URL for 'image'/'carousel' creatives, or the
    // video URL for 'reel' creatives — one field either way since only one
    // file is ever attached per creative today.
    imageUrl: { type: String, required: true },
    // Poster frame for 'reel' creatives (via ffmpeg) or first-page render for
    // 'pdf' creatives (via pdfjs), generated once at upload time and stored
    // here — S3 has no Cloudinary-style on-the-fly transform, so this can't
    // be derived from imageUrl at render time the way it used to be.
    thumbnailUrl: String,
    // Headline + description the admin writes for this creative — shown to
    // advisors browsing the Content Library (and usable as a ready-made
    // share caption). Optional so existing/newly-uploaded creatives keep
    // working before an admin fills these in.
    title: String,
    description: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Creative', creativeSchema);
module.exports.CREATIVE_CATEGORIES = CREATIVE_CATEGORIES;
module.exports.CREATIVE_TYPES = CREATIVE_TYPES;
module.exports.CREATIVE_FORMATS = CREATIVE_FORMATS;
