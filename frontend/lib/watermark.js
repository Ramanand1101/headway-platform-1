// Adds a repeated "PREVIEW" watermark to a Cloudinary image URL via
// on-the-fly transformation (fl_tiled repeats the text layer across the
// whole image) — no separate watermarked file is stored. Once an advisor
// spends a credit to unlock the image, the clean original URL (this
// function's input) is what gets saved to their own library.
export function watermarkedUrl(url) {
  if (!url || !url.includes('/upload/')) return url;

  // Dense, high-opacity tile + a slight quality drop — screenshots can't be
  // blocked on the web (that only exists for DRM video), so this is the
  // real deterrent: unusable without unlocking, same as any stock photo site.
  const layer = 'l_text:Arial_30_bold:PREVIEW,co_rgb:FFFFFF,o_55,a_-30,fl_layer_apply,fl_tiled';
  return url.replace('/upload/', `/upload/${layer}/q_auto:low/`);
}
