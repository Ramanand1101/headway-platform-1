const mongoose = require('mongoose');

const contentPostSchema = new mongoose.Schema(
  {
    advisorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Advisor',
      required: true,
      index: true
    },
    title: String,
    slug: { type: String, index: true },
    body: String,
    status: {
      type: String,
      enum: ['draft', 'pending_review', 'published'],
      default: 'draft'
    },
    generatedBy: { type: String, enum: ['ai', 'manual'], default: 'ai' },
    publishedAt: Date
  },
  { timestamps: true }
);

// One slug per advisor, not globally — two different advisors can each have
// their own "5-tax-saving-tips" post.
contentPostSchema.index({ advisorId: 1, slug: 1 }, { unique: true, sparse: true });

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

contentPostSchema.pre('validate', async function assignSlug(next) {
  if (this.slug || !this.title) return next();

  const base = slugify(this.title) || 'post';
  let candidate = base;
  let suffix = 2;

  const ContentPost = this.constructor;
  while (
    await ContentPost.exists({ advisorId: this.advisorId, slug: candidate, _id: { $ne: this._id } })
  ) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model('ContentPost', contentPostSchema);
