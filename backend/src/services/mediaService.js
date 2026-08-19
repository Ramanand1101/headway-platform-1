const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { uploadBuffer, uploadBufferAtKey, keyFromUrl, objectExists, PUBLIC_BASE_URL } = require('./s3Service');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

ffmpeg.setFfmpegPath(ffmpegPath);

// @napi-rs/canvas ships a separate native binary per OS/CPU as an optional
// dependency, and font registration reads a file off disk — either can
// legitimately be missing/fail to load on a given deployment target. This
// whole module is required transitively by every controller (via
// creativeController.js), so a top-level `require('@napi-rs/canvas')` or a
// top-level GlobalFonts.registerFromPath() call that throws takes down the
// ENTIRE API on cold start, not just the watermark/PDF-thumbnail features
// that actually need it — loaded lazily instead, on first real use.
// Bundled under src/assets (a plain source file, not a node_modules asset
// reached via require.resolve('pdfjs-dist/...')) — a path built from another
// package's internal directory is exactly the kind of dynamically-computed
// path that serverless bundlers' static file-tracing can miss, which is what
// silently broke this the first time: registerFromPath() doesn't throw when
// the file it's pointed at isn't actually in the deployed bundle, it just
// fails to register the font — so `ctx.font` referencing an unregistered
// family draws nothing, and getOrCreateWatermarkedUrl below happily
// "succeeds" with a clean, un-watermarked image. That's not a cosmetic bug,
// it's a paywall bypass, so registration failure here must throw loudly
// instead of degrading silently.
const WATERMARK_FONT_FAMILY = 'HeadwayWatermark';
const WATERMARK_FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'LiberationSans-Bold.ttf');
let canvasLib;
function loadCanvasLib() {
  if (!canvasLib) {
    const lib = require('@napi-rs/canvas');
    const registered = lib.GlobalFonts.registerFromPath(WATERMARK_FONT_PATH, WATERMARK_FONT_FAMILY);
    if (!registered || !lib.GlobalFonts.has(WATERMARK_FONT_FAMILY)) {
      throw new Error(`Watermark font failed to register from ${WATERMARK_FONT_PATH}`);
    }
    canvasLib = lib;
  }
  return canvasLib;
}

// pdfjs-dist is ESM-only; the rest of this codebase is CommonJS, so it's
// loaded lazily via dynamic import() and cached instead of a top-level
// require().
let pdfjsLibPromise;
function loadPdfjs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsLibPromise;
}

// pdfjs renders into a canvas via this factory instead of the DOM canvas
// it expects in a browser — @napi-rs/canvas is a prebuilt native binding
// (no system cairo/pango needed), so it works on serverless hosts the same
// way sharp and the ffmpeg binary already do.
class NodeCanvasFactory {
  create(width, height) {
    const { createCanvas } = loadCanvasLib();
    const canvas = createCanvas(width, height);
    return { canvas, context: canvas.getContext('2d') };
  }
  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

// Single large, semi-transparent diagonal "PREVIEW" watermark — same look
// the old Cloudinary `l_text` overlay produced. Drawn on a canvas (sharp has
// no built-in text rendering) using the bundled font above, then composited
// over the source image as a PNG buffer.
function watermarkPng(width, height) {
  const { createCanvas } = loadCanvasLib();
  const fontSize = Math.round(Math.min(width, height) * 0.18);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.translate(width / 2, height / 2);
  ctx.rotate((-30 * Math.PI) / 180);
  ctx.font = `bold ${fontSize}px ${WATERMARK_FONT_FAMILY}`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PREVIEW', 0, 0);
  return canvas.toBuffer('image/png');
}

// Small rounded "business card" badge (advisor name + phone) drawn
// bottom-left — carries its own semi-transparent background so it stays
// legible regardless of what's behind it. Bottom-left rather than top-left:
// these creative templates almost always put their own eyebrow tag/headline
// starting near the top-left, so a badge there collides with the template's
// own text; the bottom corners are consistently the one area left empty
// across templates (the CTA button/logo block is bottom-*center*).
function personalizationBadgePng(width, height, name, phone) {
  const { createCanvas } = loadCanvasLib();
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const pad = Math.round(width * 0.035);
  const nameSize = Math.max(14, Math.round(width * 0.032));
  const phoneSize = Math.max(11, Math.round(width * 0.024));
  const lineGap = Math.round(nameSize * 0.35);

  ctx.font = `bold ${nameSize}px ${WATERMARK_FONT_FAMILY}`;
  const nameWidth = ctx.measureText(name).width;
  ctx.font = `${phoneSize}px ${WATERMARK_FONT_FAMILY}`;
  const phoneWidth = phone ? ctx.measureText(phone).width : 0;

  const boxWidth = Math.max(nameWidth, phoneWidth) + pad * 2;
  const boxHeight = nameSize + (phone ? phoneSize + lineGap : 0) + pad * 1.6;
  const boxX = pad;
  const boxY = height - pad - boxHeight;
  const radius = Math.min(boxHeight * 0.22, 16);

  ctx.beginPath();
  ctx.moveTo(boxX + radius, boxY);
  ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + boxHeight, radius);
  ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX, boxY + boxHeight, radius);
  ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY, radius);
  ctx.arcTo(boxX, boxY, boxX + boxWidth, boxY, radius);
  ctx.closePath();
  ctx.fillStyle = 'rgba(11, 20, 38, 0.72)';
  ctx.fill();

  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${nameSize}px ${WATERMARK_FONT_FAMILY}`;
  ctx.fillText(name, boxX + pad, boxY + pad * 0.8);

  if (phone) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `${phoneSize}px ${WATERMARK_FONT_FAMILY}`;
    ctx.fillText(phone, boxX + pad, boxY + pad * 0.8 + nameSize + lineGap);
  }

  return canvas.toBuffer('image/png');
}

async function fetchBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not fetch source (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

// Derivatives are cached in S3 under a hash of the source key, so a given
// image is only ever watermarked once — repeat requests just redirect to
// the already-generated file instead of re-running sharp every time.
function derivedKey(prefix, sourceUrl, ext) {
  const hash = crypto.createHash('sha1').update(sourceUrl).digest('hex');
  return `derived/${prefix}/${hash}.${ext}`;
}

async function getOrCreateWatermarkedUrl(sourceUrl) {
  const key = derivedKey('watermark', sourceUrl, 'jpg');
  if (await objectExists(key)) return `${PUBLIC_BASE_URL}/${key}`;

  const original = await fetchBuffer(sourceUrl);
  const meta = await sharp(original).metadata();
  const overlay = watermarkPng(meta.width || 800, meta.height || 800);
  const watermarked = await sharp(original)
    .composite([{ input: overlay, gravity: 'center' }])
    .jpeg({ quality: 85 })
    .toBuffer();

  const url = await uploadBuffer(watermarked, { folder: 'derived/watermark', filename: `${crypto.randomBytes(4).toString('hex')}.jpg`, contentType: 'image/jpeg' });
  return url;
}

// Content-addressed by source URL + advisor identity — same advisor
// re-downloading the same creative reuses the already-generated file
// instead of re-running canvas/sharp (or pdf-lib) every time.
function personalizedKey(sourceUrl, advisorId, ext) {
  const hash = crypto.createHash('sha1').update(`${sourceUrl}|${advisorId}`).digest('hex');
  return `derived/personalized/${hash}.${ext}`;
}

// Overlays a small "advisor name + phone" badge (top-left) onto an image
// creative — used at download/share time so the file the advisor actually
// posts carries their own contact details, not the generic template alone.
async function getOrCreatePersonalizedImageUrl(sourceUrl, { advisorId, name, phone }) {
  const key = personalizedKey(sourceUrl, advisorId, 'jpg');
  if (await objectExists(key)) return `${PUBLIC_BASE_URL}/${key}`;

  const original = await fetchBuffer(sourceUrl);
  const meta = await sharp(original).metadata();
  const badge = personalizationBadgePng(meta.width || 800, meta.height || 800, name, phone);
  const personalized = await sharp(original)
    .composite([{ input: badge, gravity: 'northwest' }])
    .jpeg({ quality: 90 })
    .toBuffer();

  return uploadBufferAtKey(personalized, key, 'image/jpeg');
}

// Same idea for a PDF carousel, applied to every page — drawn directly with
// pdf-lib (a pure-JS PDF editor, no native binary) rather than rasterizing
// each page through pdfjs/canvas and re-saving as images, which would both
// balloon file size and throw away the PDF's original vector quality.
async function getOrCreatePersonalizedPdfUrl(sourceUrl, { advisorId, name, phone }) {
  const key = personalizedKey(sourceUrl, advisorId, 'pdf');
  if (await objectExists(key)) return `${PUBLIC_BASE_URL}/${key}`;

  const original = await fetchBuffer(sourceUrl);
  const pdfDoc = await PDFDocument.load(original);
  const nameFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const phoneFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();
    const pad = width * 0.035;
    const nameSize = Math.max(10, width * 0.032);
    const phoneSize = Math.max(8, width * 0.024);
    const lineGap = nameSize * 0.35;
    const nameWidth = nameFont.widthOfTextAtSize(name, nameSize);
    const phoneWidth = phone ? phoneFont.widthOfTextAtSize(phone, phoneSize) : 0;
    const boxWidth = Math.max(nameWidth, phoneWidth) + pad * 2;
    const boxHeight = nameSize + (phone ? phoneSize + lineGap : 0) + pad * 1.6;
    const boxBottom = pad;
    const boxTop = boxBottom + boxHeight;

    page.drawRectangle({
      x: pad,
      y: boxBottom,
      width: boxWidth,
      height: boxHeight,
      color: rgb(11 / 255, 20 / 255, 38 / 255),
      opacity: 0.72
    });

    const nameBaselineY = boxTop - pad * 0.8 - nameSize * 0.82;
    page.drawText(name, { x: pad * 2, y: nameBaselineY, size: nameSize, font: nameFont, color: rgb(1, 1, 1) });

    if (phone) {
      const phoneBaselineY = nameBaselineY - lineGap - phoneSize * 0.82;
      page.drawText(phone, { x: pad * 2, y: phoneBaselineY, size: phoneSize, font: phoneFont, color: rgb(0.92, 0.92, 0.92) });
    }
  }

  const personalized = Buffer.from(await pdfDoc.save());
  return uploadBufferAtKey(personalized, key, 'application/pdf');
}

// Extracts a still JPEG from a video buffer — used as a reel's
// poster/thumbnail, generated once at upload time (not per-request;
// decoding video is comparatively expensive) and stored on the Creative doc.
// Grabs the frame at 1s rather than 0s: most of these reels open on a
// black fade-in, so a literal first frame is a blank/black thumbnail.
async function extractVideoThumbnail(videoBuffer) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'reel-'));
  const videoPath = path.join(tmpDir, 'input.mp4');
  const framePath = path.join(tmpDir, 'frame.jpg');
  try {
    await fs.writeFile(videoPath, videoBuffer);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .on('end', resolve)
        .on('error', reject)
        .screenshots({ timestamps: ['1'], filename: 'frame.jpg', folder: tmpDir, size: '720x?' });
    });
    return await fs.readFile(framePath);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// Rasterizes the first page of a PDF carousel to a JPEG — used as its grid
// thumbnail, generated once at upload time (not per-request; parsing/
// rendering a PDF is comparatively expensive) and stored on the Creative doc,
// same pattern as extractVideoThumbnail above.
async function extractPdfThumbnail(pdfBuffer) {
  const pdfjsLib = await loadPdfjs();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(pdfBuffer),
    disableFontFace: true,
    standardFontDataUrl: path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts') + '/'
  });
  let doc;
  try {
    doc = await loadingTask.promise;
    const page = await doc.getPage(1);
    const viewport = page.getViewport({ scale: 1200 / page.getViewport({ scale: 1 }).width });
    const canvasFactory = new NodeCanvasFactory();
    const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);
    await page.render({ canvasContext: canvasAndContext.context, viewport, canvasFactory }).promise;
    return canvasAndContext.canvas.toBuffer('image/jpeg', 85);
  } finally {
    await loadingTask.destroy();
  }
}

module.exports = {
  getOrCreateWatermarkedUrl,
  extractVideoThumbnail,
  extractPdfThumbnail,
  getOrCreatePersonalizedImageUrl,
  getOrCreatePersonalizedPdfUrl,
  keyFromUrl
};
