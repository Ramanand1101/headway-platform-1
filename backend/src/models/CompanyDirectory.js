const mongoose = require('mongoose');

// Admin-curated master list of insurer/company logos, shared with every
// advisor's "Company working with" picker so they don't have to source and
// upload the same well-known logos themselves.
const CATEGORIES = ['life', 'health', 'general'];

const companyDirectorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    category: { type: String, enum: CATEGORIES, required: true, index: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CompanyDirectory', companyDirectorySchema);
module.exports.CATEGORIES = CATEGORIES;
