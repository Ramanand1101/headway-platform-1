const HomepageLead = require('../models/HomepageLead');

// POST /api/homepage-leads — public, no auth. The marketing homepage's
// "Claim Free Website" contact form, submitted by someone who isn't an
// advisor yet.
exports.createHomepageLead = async (req, res, next) => {
  try {
    const { name, phone, irdaiLicenseNumber, city, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }

    const lead = await HomepageLead.create({ name, phone, irdaiLicenseNumber, city, message });
    res.status(201).json({ lead });
  } catch (err) {
    next(err);
  }
};

// GET /api/homepage-leads — admin-only.
exports.listHomepageLeads = async (req, res, next) => {
  try {
    const leads = await HomepageLead.find().sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/homepage-leads/:id/status — admin-only.
exports.updateHomepageLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'converted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const lead = await HomepageLead.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};
