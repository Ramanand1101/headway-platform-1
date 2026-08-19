const mongoose = require('mongoose');

// Submissions from the public marketing homepage's contact form — a
// prospective advisor expressing interest before they've signed up (no
// Advisor account exists yet), unlike Lead, which is a client enquiry
// captured on an already-onboarded advisor's own microsite.
const homepageLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    irdaiLicenseNumber: String,
    city: String,
    message: String,
    status: { type: String, enum: ['new', 'contacted', 'converted'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomepageLead', homepageLeadSchema);
