const cloudinary = require('cloudinary').v2;
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

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const uploaded = await cloudinary.uploader.upload(dataUri, {
      folder: 'site-banners',
      public_id: key,
      overwrite: true,
      resource_type: 'image'
    });

    const banner = await SiteBanner.findOneAndUpdate(
      { key },
      { $set: { imageUrl: uploaded.secure_url, key } },
      { new: true, upsert: true }
    );

    res.json({ banner });
  } catch (err) {
    next(err);
  }
};
