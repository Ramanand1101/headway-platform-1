const { uploadBuffer, deleteByUrl } = require('../services/s3Service');
const SiteBanner = require('../models/SiteBanner');

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await SiteBanner.find();
    res.json({ banners });
  } catch (err) {
    next(err);
  }
};

exports.uploadBanner = async (req, res, next) => {
  try {
    const key = String(req.params.key || '').trim();
    if (!key) {
      return res.status(400).json({ error: 'Image key is required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const existing = await SiteBanner.findOne({ key });

    const imageUrl = await uploadBuffer(req.file.buffer, {
      folder: 'site-banners',
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const banner = await SiteBanner.findOneAndUpdate(
      { key },
      { $set: { imageUrl, key } },
      { new: true, upsert: true }
    );

    if (existing?.imageUrl) await deleteByUrl(existing.imageUrl).catch(() => {});

    res.json({ banner });
  } catch (err) {
    next(err);
  }
};
