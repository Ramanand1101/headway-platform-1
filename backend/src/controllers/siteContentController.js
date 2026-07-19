const SiteContent = require('../models/SiteContent');

// GET /api/site/content/:page — public, returns saved overrides or null if
// the page has never been edited (frontend falls back to its own defaults).
exports.getContent = async (req, res, next) => {
  try {
    const page = String(req.params.page || '').trim();
    if (!page) return res.status(400).json({ error: 'Page key is required' });

    const doc = await SiteContent.findOne({ page });
    res.json({ content: doc?.data || null });
  } catch (err) {
    next(err);
  }
};

// PUT /api/site/content/:page — admin only, replaces the stored content
// for that page with the full object sent from the admin editor.
exports.updateContent = async (req, res, next) => {
  try {
    const page = String(req.params.page || '').trim();
    if (!page) return res.status(400).json({ error: 'Page key is required' });
    if (!req.body?.data || typeof req.body.data !== 'object') {
      return res.status(400).json({ error: 'Content data is required' });
    }

    const doc = await SiteContent.findOneAndUpdate(
      { page },
      { $set: { data: req.body.data } },
      { new: true, upsert: true }
    );

    res.json({ content: doc.data });
  } catch (err) {
    next(err);
  }
};
