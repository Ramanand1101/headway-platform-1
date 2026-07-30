// Adds a repeated "PREVIEW" watermark to a Cloudinary image URL via
// on-the-fly transformation (fl_tiled repeats the text layer across the
// whole image) — no separate watermarked file is stored. Once an advisor
// spends a credit to unlock the image, the clean original URL (this
// function's input) is what gets saved to their own library.
export function watermarkedUrl(url) {
  if (!url || !url.includes('/upload/')) return url;

  const layer = 'l_text:Arial_36_bold:PREVIEW,co_rgb:FFFFFF,o_35,a_-30,fl_layer_apply,fl_tiled';
  return url.replace('/upload/', `/upload/${layer}/`);
}
