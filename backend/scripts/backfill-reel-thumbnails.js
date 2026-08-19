// One-off migration: extractVideoThumbnail used to grab the frame at 0s,
// which for most of these reels lands on a black fade-in intro — so every
// reel's poster/thumbnail (and, downstream, its locked-preview watermark)
// was a solid black square. Fixed to grab the frame at 1s instead; this
// regenerates thumbnailUrl for every existing 'reel' Creative so the fix
// applies retroactively, not just to future uploads.
//
// Uploads each new thumbnail under a fresh filename (not overwriting the old
// key) — getOrCreateWatermarkedUrl caches its derived output by a hash of
// the source URL, so reusing the old key would keep serving the old
// (already-cached, still-black) watermarked version forever.
//
// Usage: node scripts/backfill-reel-thumbnails.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');
const Creative = require('../src/models/Creative');
const { uploadBuffer } = require('../src/services/s3Service');
const { extractVideoThumbnail } = require('../src/services/mediaService');

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  const reels = await Creative.find({ type: 'reel' });
  console.log(`${reels.length} reel creative(s) to regenerate.`);

  const stats = { generated: 0, failed: 0 };
  for (const creative of reels) {
    try {
      const res = await fetch(creative.imageUrl);
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const frame = await extractVideoThumbnail(buffer);

      if (!DRY_RUN) {
        const thumbnailUrl = await uploadBuffer(frame, {
          folder: `creatives/${creative.type}/${creative.category}/thumbnails`,
          filename: `${creative._id}-${Date.now()}.jpg`,
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
