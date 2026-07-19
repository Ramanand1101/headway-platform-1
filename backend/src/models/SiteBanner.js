const mongoose = require('mongoose');

const siteBannerSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    imageUrl: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteBanner', siteBannerSchema);
