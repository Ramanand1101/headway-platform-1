const cloudinary = require('cloudinary').v2;
const Creative = require('../models/Creative');

const { CREATIVE_CATEGORIES } = Creative;

// GET /api/creatives?category=life — any logged-in advisor/admin browses the
// shared creative library, optionally filtered to one folder.
exports.listCreatives = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      if (!CREATIVE_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      filter.category = req.query.category;
    }

    const creatives = await Creative.find(filter).sort({ createdAt: -1 });
    res.json({ creatives, categories: CREATIVE_CATEGORIES });
  } catch (err) {
    next(err);
  }
};

// POST /api/creatives  (admin-only) — uploads one or more images into a
// category folder, shared instantly with every advisor's Content Library.
exports.uploadCreatives = async (req, res, next) => {
  try {
    const { category } = req.body;
    if (!CREATIVE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: 'At least one image file is required' });
    }

    const created = await Promise.all(
      files.map(async (file, index) => {
        const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        const uploaded = await cloudinary.uploader.upload(dataUri, {
          folder: `creatives/${category}`,
          public_id: `${Date.now()}-${index}`,
          resource_type: 'image'
        });
        return Creative.create({ category, imageUrl: uploaded.secure_url });
      })
    );

    res.status(201).json({ creatives: created });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/creatives/:id  (admin-only)
exports.deleteCreative = async (req, res, next) => {
  try {
    const creative = await Creative.findByIdAndDelete(req.params.id);
    if (!creative) return res.status(404).json({ error: 'Creative not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
