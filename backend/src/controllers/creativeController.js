const { uploadBuffer, deleteByUrl, getPresignedUploadUrl } = require('../services/s3Service');
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

// Which file formats each content type accepts — reels must be an actual
// video (the poster-frame/playback logic assumes it); images/carousels are
// stills, but a carousel can also be a swipeable PDF deck.
const ALLOWED_FORMATS_BY_TYPE = {
  image: ['image'],
  carousel: ['image', 'pdf'],
  reel: ['video']
};

function formatFromMimetype(mimetype) {
  if (mimetype === 'application/pdf') return 'pdf';
  if (mimetype.startsWith('video/')) return 'video';
  return 'image';
}

// POST /api/creatives  (admin-only) — uploads one or more files (images,
// videos or PDFs) into a category+type folder, shared instantly with every
// advisor's Content Library. Multiple files upload in parallel in a single
// request (the admin UI still sends one request per file to stay under the
// hosting platform's body-size limit for large videos, but the endpoint
// itself supports a real batch).
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
      return res.status(400).json({ error: `At least one ${type === 'reel' ? 'video' : 'image or PDF'} file is required` });
    }

    const allowedFormats = ALLOWED_FORMATS_BY_TYPE[type];
    const badFile = files.find((f) => !allowedFormats.includes(formatFromMimetype(f.mimetype)));
    if (badFile) {
      return res.status(400).json({
        error:
          type === 'reel'
            ? `${badFile.originalname} isn't a video — reels must be uploaded as video files.`
            : `${badFile.originalname} isn't an image or PDF.`
      });
    }

    const created = await Promise.all(
      files.map(async (file) => {
        const format = formatFromMimetype(file.mimetype);
        const imageUrl = await uploadBuffer(file.buffer, {
          folder: `creatives/${type}/${category}`,
          filename: file.originalname,
          contentType: file.mimetype
        });

        let thumbnailUrl;
        if (format === 'video') {
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

        return Creative.create({ category, type, format, imageUrl, thumbnailUrl });
      })
    );

    res.status(201).json({ creatives: created });
  } catch (err) {
    next(err);
  }
};

// POST /api/creatives/presigned-upload  (admin-only) — for large files
// (reel videos) that don't fit through the hosting platform's ~4.5MB
// request-body cap. Returns a one-time S3 PUT URL the browser uploads
// straight to (bypassing our server entirely for the actual bytes) plus
// the public URL the file will have once that PUT succeeds — the admin UI
// then calls finalizeCreative below with that URL to actually save it.
exports.getPresignedUpload = async (req, res, next) => {
  try {
    const { category, type, filename, contentType } = req.body;
    if (!CREATIVE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (!CREATIVE_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }
    const format = formatFromMimetype(contentType);
    if (!ALLOWED_FORMATS_BY_TYPE[type].includes(format)) {
      return res.status(400).json({ error: `${type} does not accept ${format} files` });
    }

    const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
      folder: `creatives/${type}/${category}`,
      filename,
      contentType
    });
    res.json({ uploadUrl, publicUrl, format });
  } catch (err) {
    next(err);
  }
};

// POST /api/creatives/finalize  (admin-only) — called after the browser's
// direct-to-S3 PUT (above) succeeds. Fetches the file back down
// server-to-server (no request-body-size limit applies to an outgoing
// fetch, only to incoming request bodies) to generate a reel's poster
// thumbnail, then saves the Creative doc.
exports.finalizeCreative = async (req, res, next) => {
  try {
    const { category, type, format, imageUrl, title, description } = req.body;
    if (!CREATIVE_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }
    if (!CREATIVE_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }
    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }
    if (!ALLOWED_FORMATS_BY_TYPE[type].includes(format)) {
      return res.status(400).json({ error: `${type} does not accept ${format} files` });
    }

    let thumbnailUrl;
    if (format === 'video') {
      // Best-effort — a bad/corrupt video shouldn't block the upload, it'll
      // just fall back to no poster image until re-processed.
      try {
        const videoRes = await fetch(imageUrl);
        if (videoRes.ok) {
          const buffer = Buffer.from(await videoRes.arrayBuffer());
          const frame = await extractVideoThumbnail(buffer);
          thumbnailUrl = await uploadBuffer(frame, {
            folder: `creatives/${type}/${category}/thumbnails`,
            filename: `${Date.now()}.jpg`,
            contentType: 'image/jpeg'
          });
        }
      } catch (err) {
        console.error('Reel thumbnail generation failed:', err.message);
      }
    }

    const creative = await Creative.create({ category, type, format, imageUrl, thumbnailUrl, title, description });
    res.status(201).json({ creative });
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
    const creative = await Creative.findById(req.params.id).select('imageUrl thumbnailUrl title description type format');
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
