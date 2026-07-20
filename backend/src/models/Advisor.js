const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    customDomain: { type: String, default: null },
    name: { type: String, required: true },
    photoUrl: String,
    city: String,
    specialization: [String],
    // Short tagline shown next to the advisor's name in the microsite hero.
    bio: String,
    // Longer write-up shown in the microsite's "About Me" section — separate
    // from `bio` so the hero tagline and the about-page story can differ.
    aboutMe: String,
    services: [String],
    // Optional richer service cards (title + description) shown on the
    // microsite's services carousel. Falls back to the plain `services`
    // list above when empty, so existing advisors keep working unchanged.
    serviceOfferings: [{ title: String, description: String }],
    // Insurers/companies the advisor is empanelled with, each with an
    // optional logo shown on the microsite's "Companies I Work With" grid.
    companiesWorkedWith: [{ name: String, logoUrl: String }],
    // Awards/certificates shown in the microsite's Achievements section,
    // e.g. { name: 'MDRT Top of the Table', description: 'Awarded for...' }.
    achievements: [{ imageUrl: String, name: String, description: String }],
    googleBusiness: {
      rating: Number,
      reviewCount: Number,
      reviewLink: String,
      mapsLink: String
    },
    faqs: [{ question: String, answer: String }],
    email: String,
    officeAddress: String,
    irdaiLicenseNumber: String,
    yearsExperience: String,
    // Short badge strings shown in the hero, e.g. "IRDAI Licensed", "MDRT Member".
    credentials: [String],
    vision: String,
    mission: String,
    missionPillars: [String],
    // Microsite appearance: a curated theme key (see frontend/lib/micrositeThemes.js)
    // plus optional per-section photos. Falls back to photoUrl/defaults when unset.
    themeKey: { type: String, default: 'charcoal-gold' },
    micrositeImages: {
      hero: String,
      about: String,
      achievements: String,
      contact: String,
      vision: String,
      mission: String
    },
    // Free-form overrides for section headings, eyebrows, paragraphs and
    // button labels across the microsite that are otherwise fixed template
    // copy (e.g. "Insurance Advice You Can Trust"). Keyed by field name (see
    // frontend/lib/advisorMicrositeCopyDefaults.js) — unset keys fall back to
    // the default copy. Edited only from the admin's "Enter as Advisor" view.
    micrositeContent: { type: mongoose.Schema.Types.Mixed, default: {} },
    planTier: {
      type: String,
      enum: ['basic', 'standard', 'premium'],
      default: 'basic'
    },
    // Free AI blog-generation credits. Premium plan advisors get unlimited
    // AI generation regardless of this count (see requireAiCredit helper).
    aiCredits: { type: Number, default: 3 },
    // Separate credit pool for the social content library (reels/carousels/
    // image posts) shown on the advisor dashboard — unrelated to aiCredits.
    contentCredits: { type: Number, default: 50 },
    // Photos the advisor has uploaded to their Content Library for use in
    // reels/carousels/posters.
    contentLibraryImages: [String],
    contactNumber: String,
    whatsappNumber: String,
    socialLinks: {
      linkedin: String,
      instagram: String,
      facebook: String,
      youtube: String
    },
    // OAuth connection to the advisor's own Instagram Business/Creator
    // account (Instagram Business Login), used to publish posts and read
    // comments/insights/messages only on the advisor's instruction.
    instagram: {
      connected: { type: Boolean, default: false },
      igUserId: String,
      username: String,
      accountType: String,
      accessToken: String,
      tokenExpiresAt: Date,
      connectedAt: Date
    },
    // OAuth connection to a Facebook Page the advisor administers (Facebook
    // Login for Business), used to publish posts and read comments/messages
    // only on the advisor's instruction. Page access tokens obtained via a
    // long-lived user token don't expire on their own.
    facebook: {
      connected: { type: Boolean, default: false },
      pageId: String,
      pageName: String,
      pageAccessToken: String,
      connectedAt: Date
    },
    isActive: { type: Boolean, default: true },
    onboardedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advisor', advisorSchema);
