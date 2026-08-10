const { uploadBuffer, deleteByUrl } = require('../services/s3Service');
const { extractVideoThumbnail } = require('../services/mediaService');
const Creative = require('../models/Creative');

const { CREATIVE_CATEGORIES, CREATIVE_TYPES } = Creative;

// GET /api/creatives?category=life&type=reel — any logged-in advisor/admin
// browses the shared creative library, optionally filtered by folder and/or
// content format.
exports.listCreatives = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) {
      if (!CREATIVE_CATEGORIES.includes(req.query.category)) {
        return res.status(400).json({ error: 'Invalid category' });
      }
      filter.category = req.query.category;
    }
    if (req.query.type) {
      if (!CREATIVE_TYPES.includes(req.query.type)) {
        return res.status(400).json({ error: 'Invalid type' });
      }
      filter.type = req.query.type;
    }

    const creatives = await Creative.find(filter).sort({ createdAt: -1 });
    res.json({ creatives, categories: CREATIVE_CATEGORIES, types: CREATIVE_TYPES });
  } catch (err) {
    next(err);
  }
};

// POST /api/creatives  (admin-only) — uploads one or more images/videos into
// a category+type folder, shared instantly with every advisor's Content
// Library. Reels are uploaded as video; images/carousels as image.
exports.uploadCreatives = async (req, res, next) => {
  try {
    const { category, type = 'image' } = req.body;
    if (!CREATIVE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (!CREATIVE_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: `At least one ${type === 'reel' ? 'video' : 'image'} file is required` });
    }

    const created = await Promise.all(
      files.map(async (file) => {
        const imageUrl = await uploadBuffer(file.buffer, {
          folder: `creatives/${type}/${category}`,
          filename: file.originalname,
          contentType: file.mimetype
        });

        let thumbnailUrl;
        if (type === 'reel') {
          // Best-effort — a bad/corrupt video shouldn't block the upload,
          // it'll just fall back to no poster image until re-processed.
          try {
            const frame = await extractVideoThumbnail(file.buffer);
            thumbnailUrl = await uploadBuffer(frame, {
              folder: `creatives/${type}/${category}/thumbnails`,
              filename: `${file.originalname}.jpg`,
              contentType: 'image/jpeg'
            });
          } catch (err) {
            console.error('Reel thumbnail generation failed:', err.message);
          }
        }

        return Creative.create({ category, type, imageUrl, thumbnailUrl });
      })
    );

    res.status(201).json({ creatives: created });
  } catch (err) {
    next(err);
  }
};

// GET /api/creatives/:id/public — no auth. Powers the /share/creative/:id
// landing page's Open Graph tags, so WhatsApp/Facebook/LinkedIn render a
// real image+headline+description preview card when an advisor shares that
// page's link, instead of a bare file URL. Only the fields needed for a
// preview card are exposed — nothing else on the document.
exports.getPublicCreative = async (req, res, next) => {
  try {
    const creative = await Creative.findById(req.params.id).select('imageUrl thumbnailUrl title description type');
    if (!creative) return res.status(404).json({ error: 'Not found' });
    res.json({ creative });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/creatives/:id  (admin-only) — sets/updates the headline
// (title) and description shown to advisors browsing this creative.
exports.updateCreative = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const creative = await Creative.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description } },
      { new: true }
    );
    if (!creative) return res.status(404).json({ error: 'Creative not found' });
    res.json({ creative });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/creatives/:id  (admin-only)
exports.deleteCreative = async (req, res, next) => {
  try {
    const creative = await Creative.findByIdAndDelete(req.params.id);
    if (!creative) return res.status(404).json({ error: 'Creative not found' });
    await Promise.all(
      [creative.imageUrl, creative.thumbnailUrl].filter(Boolean).map((url) => deleteByUrl(url).catch(() => {}))
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
