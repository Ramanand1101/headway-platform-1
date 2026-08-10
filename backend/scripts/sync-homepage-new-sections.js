// One-off migration: the live `SiteContent` override for the homepage (page:
// 'homepage') predates today's new sections — `about`, `ctaBanner`, and the
// 4th "Blogs" capabilities card. Since the frontend now shallow-merges the
// override over the code defaults (missing top-level keys fall back fine),
// this isn't strictly required to avoid a crash — but without it, the
// override's own `capabilities.cards` array (3 items) fully replaces the
// code default's 4-item array, so the new "Blogs" card silently never
// shows until an admin re-saves from /admin/homepage. This backfills those
// specific pieces onto the existing saved override, leaving everything
// else (the admin's real edited copy/theme) untouched.
//
// Usage: node scripts/sync-homepage-new-sections.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');

const DRY_RUN = process.argv.includes('--dry-run');

// Mirrors frontend/lib/homepageContent.js's `about`/`ctaBanner`/capabilities
// defaults — duplicated here rather than imported since that file uses ESM
// `export` syntax and this backend script runs under plain CommonJS.
const ABOUT_DEFAULT = {
  eyebrow: 'About The Platform',
  heading: 'Built around what advisors actually need',
  paragraph:
    "InsuranceAdvise.in started with one problem: licensed advisors were losing clients to whoever showed up first online. So the platform gives every advisor the two things that fix that — a real website and a steady stream of content — without needing a developer or a marketing team.",
  checklist: ['No technical skill required', 'Credits only spent on what you actually post', 'Your name, your license, your practice'],
  badgeValue: '50',
  badgeLabel: 'Free Credits On Signup'
};

const CTA_BANNER_DEFAULT = {
  heading: 'Your website and your content, finally in one place.',
  paragraph: 'No developer. No separate design tool. No manual posting.',
  button: 'Get Started Free'
};

const CAPABILITIES_CARDS_DEFAULT = [
  {
    title: 'Reels',
    desc: 'Short, trust-building videos on term plans, health cover, myths and more — personalised with your identity and published to your handles in one click.'
  },
  {
    title: 'Carousels',
    desc: 'Swipeable educational posts that position you as the expert — awareness topics, claim guidance, financial planning basics, festival campaigns.'
  },
  {
    title: 'Image Posts',
    desc: "Premium posters, greetings and quote cards for every occasion — keep your feed alive and your name in every client's mind."
  },
  {
    title: 'Blogs',
    desc: 'AI-assisted article drafts you can edit and publish straight to your microsite — free to draft, and a lightweight way to build search visibility over time.'
  }
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.db.collection('sitecontents');

  const doc = await collection.findOne({ page: 'homepage' });
  if (!doc) {
    console.log('No saved homepage override found — nothing to backfill.');
    await mongoose.disconnect();
    return;
  }

  const update = {};
  if (!doc.data.about) update.about = ABOUT_DEFAULT;
  if (!doc.data.ctaBanner) update.ctaBanner = CTA_BANNER_DEFAULT;
  if ((doc.data.capabilities?.cards || []).length < 4) {
    update.capabilities = { ...doc.data.capabilities, cards: CAPABILITIES_CARDS_DEFAULT };
  }

  console.log('Backfilling:', Object.keys(update));
  if (Object.keys(update).length === 0) {
    console.log('Already up to date — nothing to do.');
  } else if (!DRY_RUN) {
    await collection.updateOne({ page: 'homepage' }, { $set: Object.fromEntries(Object.entries(update).map(([k, v]) => [`data.${k}`, v])) });
    console.log('Done.');
  } else {
    console.log('(dry run — no writes made)');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
