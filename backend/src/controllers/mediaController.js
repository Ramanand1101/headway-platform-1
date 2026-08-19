const { getOrCreateWatermarkedUrl, getOrCreatePersonalizedImageUrl, getOrCreatePersonalizedPdfUrl } = require('../services/mediaService');
const { getPresignedDownloadUrl } = require('../services/s3Service');
const { PUBLIC_BASE_URL } = require('../config/s3');
const Advisor = require('../models/Advisor');

// `src` must be one of our own bucket's URLs — this endpoint is a public
// image-transform proxy (mirrors what Cloudinary's URL-based transforms
// used to do), so it must not be usable to fetch/watermark arbitrary
// third-party URLs.
function isOwnBucketUrl(url) {
  return typeof url === 'string' && url.startsWith(PUBLIC_BASE_URL + '/');
}

exports.watermark = async (req, res, next) => {
  try {
    const { src } = req.query;
    if (!isOwnBucketUrl(src)) return res.status(400).json({ error: 'Invalid src' });
    const url = await getOrCreateWatermarkedUrl(src);
    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
};

// Authenticated (not a public transform proxy like watermark/download) —
// the advisor's name/phone come from their own account record, never from
// the request, so this can't be used to stamp one advisor's details onto
// content on another advisor's behalf.
exports.personalize = async (req, res, next) => {
  try {
    const { src, format } = req.query;
    if (!isOwnBucketUrl(src)) return res.status(400).json({ error: 'Invalid src' });
    if (!['image', 'pdf'].includes(format)) return res.status(400).json({ error: 'format must be image or pdf' });

    const advisor = await Advisor.findById(req.user.advisorId).select('name contactNumber');
    if (!advisor) return res.status(404).json({ error: 'Advisor not found' });

    const opts = { advisorId: advisor._id.toString(), name: advisor.name, phone: advisor.contactNumber || '' };
    const url =
      format === 'pdf' ? await getOrCreatePersonalizedPdfUrl(src, opts) : await getOrCreatePersonalizedImageUrl(src, opts);
    res.json({ url });
  } catch (err) {
    next(err);
  }
};

exports.download = async (req, res, next) => {
  try {
    const { src, filename } = req.query;
    if (!isOwnBucketUrl(src)) return res.status(400).json({ error: 'Invalid src' });
    const url = await getPresignedDownloadUrl(src, filename);
    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
};
