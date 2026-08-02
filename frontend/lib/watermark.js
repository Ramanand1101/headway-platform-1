// Adds a single centered "PREVIEW" watermark to a Cloudinary image URL via
// on-the-fly transformation — no separate watermarked file is stored. Once
// an advisor spends a credit to unlock the image, the clean original URL
// (this function's input) is what gets saved to their own library.
//
// One large, semi-transparent diagonal instance (not tiled) — enough to
// mark the image as unusable-without-unlocking without burying the image's
// own heading/text under dozens of repeats.
export function watermarkedUrl(url) {
  if (!url || !url.includes('/upload/')) return url;

  const layer = 'l_text:Arial_80_bold:PREVIEW,co_rgb:FFFFFF,o_45,a_-30,fl_layer_apply';
  return url.replace('/upload/', `/upload/${layer}/`);
}

// Forces the browser to download the file directly instead of navigating
// to/opening the raw Cloudinary URL (which is what happens by default for
// cross-origin links — the `download` attribute on an <a> tag is ignored
// for cross-origin resources). Cloudinary's fl_attachment flag adds a
// Content-Disposition: attachment response header, so the browser saves it
// as a file straight away with no URL ever shown to the advisor.
export function downloadableUrl(url) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/fl_attachment/');
}
