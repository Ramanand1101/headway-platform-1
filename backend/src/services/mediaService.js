const os = require('os');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('crypto');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const { uploadBuffer, keyFromUrl, objectExists, PUBLIC_BASE_URL } = require('./s3Service');

ffmpeg.setFfmpegPath(ffmpegPath);

// Single large, semi-transparent diagonal "PREVIEW" watermark — same look
// the old Cloudinary `l_text` overlay produced. Built as an SVG (sharp has
// no built-in text rendering) and composited over the source image.
function watermarkSvg(width, height) {
  const fontSize = Math.round(Math.min(width, height) * 0.18);
  return Buffer.from(`
    <svg width="${width}" height="${height}">
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold"
        fill="white" fill-opacity="0.45" text-anchor="middle" dominant-baseline="middle"
        transform="rotate(-30 ${width / 2} ${height / 2})">PREVIEW</text>
    </svg>
  `);
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
  const overlay = watermarkSvg(meta.width || 800, meta.height || 800);
  const watermarked = await sharp(original)
    .composite([{ input: overlay, gravity: 'center' }])
    .jpeg({ quality: 85 })
    .toBuffer();

  const url = await uploadBuffer(watermarked, { folder: 'derived/watermark', filename: `${crypto.randomBytes(4).toString('hex')}.jpg`, contentType: 'image/jpeg' });
  return url;
}

// Extracts a still JPEG from the first frame of a video buffer — used as a
// reel's poster/thumbnail, generated once at upload time (not per-request;
// decoding video is comparatively expensive) and stored on the Creative doc.
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
        .screenshots({ timestamps: ['0'], filename: 'frame.jpg', folder: tmpDir, size: '720x?' });
    });
    return await fs.readFile(framePath);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

module.exports = { getOrCreateWatermarkedUrl, extractVideoThumbnail, keyFromUrl };
