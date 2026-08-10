// Cloudinary used to do these as on-the-fly URL transforms; on S3 there's
// no equivalent, so both are now backend endpoints (backend/src/routes/
// mediaRoutes.js) that generate the result once and cache it in S3 (see
// backend/src/services/mediaService.js) — same net effect (a URL you can
// drop straight into <img src>/<a href>), just server-generated instead of
// string-manipulated.
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Adds a single centered "PREVIEW" watermark. Once an advisor spends a
// credit to unlock the image, the clean original URL (this function's
// input) is what gets saved to their own library.
export function watermarkedUrl(url) {
  if (!url) return url;
  return `${API_URL}/api/media/watermark?src=${encodeURIComponent(url)}`;
}

// Forces the browser to download the file directly instead of navigating
// to/opening the raw file (which is what happens by default for
// cross-origin links — the `download` attribute on an <a> tag is ignored
// for cross-origin resources).
export function downloadableUrl(url, filename) {
  if (!url) return url;
  return `${API_URL}/api/media/download?src=${encodeURIComponent(url)}${filename ? `&filename=${encodeURIComponent(filename)}` : ''}`;
}
