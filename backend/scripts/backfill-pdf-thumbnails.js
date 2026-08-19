// One-off migration: 'pdf' Creatives never got a thumbnailUrl before PDF
// first-page rendering (extractPdfThumbnail) existed, so every PDF carousel
// uploaded before that change still shows the generic file icon everywhere
// (advisor Content Library, admin list, share page) instead of an actual
// preview of the file. This backfills thumbnailUrl onto every existing
// 'pdf' Creative that doesn't have one yet.
//
// Usage: node scripts/backfill-pdf-thumbnails.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');
const Creative = require('../src/models/Creative');
const { uploadBuffer } = require('../src/services/s3Service');
const { extractPdfThumbnail } = require('../src/services/mediaService');

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const pending = await Creative.find({ format: 'pdf', thumbnailUrl: { $in: [null, undefined] } });
  console.log(`${pending.length} PDF creative(s) missing a thumbnail.`);

  const stats = { generated: 0, failed: 0 };
  for (const creative of pending) {
    try {
      const res = await fetch(creative.imageUrl);
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const frame = await extractPdfThumbnail(buffer);

      if (!DRY_RUN) {
        const thumbnailUrl = await uploadBuffer(frame, {
          folder: `creatives/${creative.type}/${creative.category}/thumbnails`,
          filename: `${creative._id}.jpg`,
          contentType: 'image/jpeg'
        });
        creative.thumbnailUrl = thumbnailUrl;
        await creative.save();
      }
      stats.generated += 1;
      console.log(`✓ ${creative._id}${DRY_RUN ? ' (dry run)' : ''}`);
    } catch (err) {
      stats.failed += 1;
      console.error(`✗ ${creative._id}: ${err.message}`);
    }
  }

  console.log(`Done. Generated: ${stats.generated}, Failed: ${stats.failed}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
