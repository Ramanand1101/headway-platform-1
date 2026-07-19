const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);
