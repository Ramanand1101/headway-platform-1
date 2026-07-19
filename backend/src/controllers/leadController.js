const Advisor = require('../models/Advisor');
const Lead = require('../models/Lead');

exports.createLead = async (req, res, next) => {
  try {
    const { advisorSlug, name, phone, email, message, interest } = req.body;
    if (!advisorSlug || !name) {
      return res.status(400).json({ error: 'advisorSlug and name are required' });
    }

    const advisor = await Advisor.findOne({ slug: advisorSlug });
    if (!advisor) {
      return res.status(404).json({ error: 'Advisor not found' });
    }

    const lead = await Lead.create({
      advisorId: advisor._id,
      name,
      phone,
      email,
      message,
      interest
    });

    res.status(201).json({ lead });
  } catch (err) {
    next(err);
  }
};

exports.getMyLeads = async (req, res, next) => {
  try {
    const leads = await Lead.find({ advisorId: req.user.advisorId }).sort({ createdAt: -1 });
    res.json({ leads });
  } catch (err) {
    next(err);
  }
};

exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['new', 'follow-up', 'converted'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, advisorId: req.user.advisorId },
      { $set: { status } },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    res.json({ lead });
  } catch (err) {
    next(err);
  }
};
