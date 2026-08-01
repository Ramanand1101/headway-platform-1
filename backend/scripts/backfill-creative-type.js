// One-off migration: Creative gained a required-in-practice `type` field
// (image/carousel/reel) alongside the existing `category`. Mongoose's
// schema `default: 'image'` only applies when hydrating documents in the
// app — it does NOT retroactively add the field to documents already in
// MongoDB, so any Creative uploaded by admin before this change is missing
// `type` entirely and gets silently excluded by `?type=` filtered queries
// (advisor's Content Library shows "Nothing in this folder yet" for
// content that's actually there). This backfills type: 'image' onto every
// existing Creative doc that has no `type` stored yet.
//
// Usage: node scripts/backfill-creative-type.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.db.collection('creatives');

  const missingType = await collection.countDocuments({ type: { $exists: false } });
  console.log(`${missingType} creative(s) missing a type field.`);

  if (missingType > 0 && !DRY_RUN) {
    const result = await collection.updateMany({ type: { $exists: false } }, { $set: { type: 'image' } });
    console.log(`Backfilled type: 'image' on ${result.modifiedCount} document(s).`);
  } else if (missingType > 0) {
    console.log('(dry run — no writes made)');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
