// Shared helpers for rendering ContentPost.body, which can be either plain
// text (AI-generated posts, or anything from before the rich editor existed)
// or HTML (anything written/edited in the admin's rich text editor).

// A quick heuristic — plain text never contains real block tags.
export function isHtmlContent(body) {
  return /<(p|ul|ol|li|blockquote|div|h[1-6])[\s>]/i.test(body || '');
}

// Strips tags for short previews (teasers/listings) regardless of format.
export function stripHtml(body) {
  if (!body) return '';
  return body
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Turns AI-generated plain text (blank-line-separated paragraphs) into basic
// paragraph HTML, so dropping it into the rich editor looks the same as
// typing it there directly.
export function plainTextToParagraphHtml(text) {
  if (!text) return '';
  return text
    .split(/\n{2,}/)
    .map((para) => `<p>${para.trim().replace(/\n/g, '<br>')}</p>`)
    .join('');
}
