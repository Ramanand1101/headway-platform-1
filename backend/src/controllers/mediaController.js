const { getOrCreateWatermarkedUrl } = require('../services/mediaService');
const { getPresignedDownloadUrl } = require('../services/s3Service');
const { PUBLIC_BASE_URL } = require('../config/s3');

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
