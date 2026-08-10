// One-off migration: moves every asset currently hosted on Cloudinary to our
// own S3 bucket, and rewrites the stored URL on every model field that
// references it. Cloudinary itself is left untouched (nothing is deleted
// there) — this only copies forward and repoints the DB.
//
// Covers every Cloudinary-URL field found in the codebase:
//   SiteBanner.imageUrl, CompanyDirectory.logoUrl, Creative.imageUrl
//   (+ generates a thumbnailUrl for 'reel' creatives that lack one),
//   Advisor.photoUrl / companiesWorkedWith[].logoUrl / achievements[].imageUrl
//   / micrositeImages.{hero,about,achievements,contact,vision,mission} /
//   contentLibraryImages[] (kept in sync with the matching Creative.imageUrl),
//   Testimonial.photoUrl, ContentPost.imageUrl.
//
// Usage: node scripts/migrate-cloudinary-to-s3.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');
const { uploadBuffer } = require('../src/services/s3Service');
const { extractVideoThumbnail } = require('../src/services/mediaService');

const DRY_RUN = process.argv.includes('--dry-run');

const stats = { scanned: 0, migrated: 0, skipped: 0, failed: 0 };
// Old Cloudinary URL -> new S3 URL, so repeated occurrences of the exact
// same URL (e.g. an advisor's unlocked contentLibraryImages entry that's
// just a copy of a Creative.imageUrl) reuse one upload instead of two.
const urlMap = new Map();

function isCloudinaryUrl(url) {
  return typeof url === 'string' && url.includes('res.cloudinary.com');
}

async function migrateUrl(url, folder) {
  if (!isCloudinaryUrl(url)) return url;
  if (urlMap.has(url)) return urlMap.get(url);

  stats.scanned += 1;
  if (DRY_RUN) {
    console.log(`[dry-run] would migrate: ${url}`);
    stats.migrated += 1;
    return url;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`fetch failed (${res.status})`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filename = url.split('/').pop().split('?')[0] || 'file';
    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    const newUrl = await uploadBuffer(buffer, { folder, filename, contentType });
    urlMap.set(url, newUrl);
    stats.migrated += 1;
    console.log(`migrated: ${url} -> ${newUrl}`);
    return newUrl;
  } catch (err) {
    stats.failed += 1;
    console.error(`FAILED (kept original): ${url} — ${err.message}`);
    return url;
  }
}

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  // --- SiteBanner ---
  for (const doc of await db.collection('sitebanners').find().toArray()) {
    const imageUrl = await migrateUrl(doc.imageUrl, 'migrated/site-banners');
    if (imageUrl !== doc.imageUrl && !DRY_RUN) {
      await db.collection('sitebanners').updateOne({ _id: doc._id }, { $set: { imageUrl } });
    }
  }

  // --- CompanyDirectory ---
  for (const doc of await db.collection('companydirectories').find().toArray()) {
    const logoUrl = await migrateUrl(doc.logoUrl, `migrated/company-directory/${doc.category || 'general'}`);
    if (logoUrl !== doc.logoUrl && !DRY_RUN) {
      await db.collection('companydirectories').updateOne({ _id: doc._id }, { $set: { logoUrl } });
    }
  }

  // --- Creative (+ reel thumbnails) ---
  for (const doc of await db.collection('creatives').find().toArray()) {
    const wasCloudinary = isCloudinaryUrl(doc.imageUrl);
    const imageUrl = await migrateUrl(doc.imageUrl, `migrated/creatives/${doc.type || 'image'}/${doc.category || 'general'}`);

    const update = {};
    if (imageUrl !== doc.imageUrl) update.imageUrl = imageUrl;

    // Reels that migrated (or already sit on S3 but never got a poster
    // frame, e.g. uploaded before thumbnailUrl existed) get one generated
    // now — the frontend needs it as a <video poster>, and S3 has no
    // Cloudinary-style on-the-fly frame extraction to fall back on.
    if (doc.type === 'reel' && !doc.thumbnailUrl && !DRY_RUN) {
      try {
        const res = await fetch(imageUrl);
        if (res.ok) {
          const buffer = Buffer.from(await res.arrayBuffer());
          const frame = await extractVideoThumbnail(buffer);
          update.thumbnailUrl = await uploadBuffer(frame, {
            folder: `migrated/creatives/reel/${doc.category || 'general'}/thumbnails`,
            filename: `${doc._id}.jpg`,
            contentType: 'image/jpeg'
          });
          console.log(`generated reel thumbnail for ${doc._id}`);
        }
      } catch (err) {
        console.error(`FAILED reel thumbnail for ${doc._id} — ${err.message}`);
      }
    } else if (doc.type === 'reel' && !doc.thumbnailUrl && DRY_RUN) {
      console.log(`[dry-run] would generate reel thumbnail for ${doc._id}`);
    }

    if (Object.keys(update).length && !DRY_RUN) {
      await db.collection('creatives').updateOne({ _id: doc._id }, { $set: update });
    }
    if (wasCloudinary) void 0; // just for clarity that this branch is intentionally covered above
  }

  // --- Advisor: photoUrl, companiesWorkedWith[], achievements[], micrositeImages.*, contentLibraryImages[] ---
  const MICROSITE_SECTIONS = ['hero', 'about', 'achievements', 'contact', 'vision', 'mission'];
  for (const doc of await db.collection('advisors').find().toArray()) {
    const update = {};

    const photoUrl = await migrateUrl(doc.photoUrl, `migrated/advisor-photos/${doc._id}`);
    if (photoUrl !== doc.photoUrl) update.photoUrl = photoUrl;

    if (Array.isArray(doc.companiesWorkedWith) && doc.companiesWorkedWith.length) {
      const migrated = await Promise.all(
        doc.companiesWorkedWith.map(async (c) => ({
          ...c,
          logoUrl: await migrateUrl(c.logoUrl, `migrated/advisor-list-images/${doc._id}`)
        }))
      );
      if (JSON.stringify(migrated) !== JSON.stringify(doc.companiesWorkedWith)) update.companiesWorkedWith = migrated;
    }

    if (Array.isArray(doc.achievements) && doc.achievements.length) {
      const migrated = await Promise.all(
        doc.achievements.map(async (a) => ({
          ...a,
          imageUrl: await migrateUrl(a.imageUrl, `migrated/advisor-list-images/${doc._id}`)
        }))
      );
      if (JSON.stringify(migrated) !== JSON.stringify(doc.achievements)) update.achievements = migrated;
    }

    if (doc.micrositeImages) {
      const migratedImages = {};
      let changed = false;
      for (const section of MICROSITE_SECTIONS) {
        const original = doc.micrositeImages[section];
        const migrated = await migrateUrl(original, `migrated/advisor-microsite-images/${doc._id}/${section}`);
        migratedImages[section] = migrated;
        if (migrated !== original) changed = true;
      }
      if (changed) update.micrositeImages = { ...doc.micrositeImages, ...migratedImages };
    }

    if (Array.isArray(doc.contentLibraryImages) && doc.contentLibraryImages.length) {
      const migrated = await Promise.all(
        doc.contentLibraryImages.map((url) => migrateUrl(url, `migrated/advisor-list-images/${doc._id}`))
      );
      if (JSON.stringify(migrated) !== JSON.stringify(doc.contentLibraryImages)) update.contentLibraryImages = migrated;
    }

    if (Object.keys(update).length && !DRY_RUN) {
      await db.collection('advisors').updateOne({ _id: doc._id }, { $set: update });
    }
  }

  // --- Testimonial ---
  for (const doc of await db.collection('testimonials').find().toArray()) {
    const photoUrl = await migrateUrl(doc.photoUrl, `migrated/testimonials/${doc.advisorId}`);
    if (photoUrl !== doc.photoUrl && !DRY_RUN) {
      await db.collection('testimonials').updateOne({ _id: doc._id }, { $set: { photoUrl } });
    }
  }

  // --- ContentPost ---
  for (const doc of await db.collection('contentposts').find().toArray()) {
    const imageUrl = await migrateUrl(doc.imageUrl, `migrated/blog-images/${doc.advisorId}`);
    if (imageUrl !== doc.imageUrl && !DRY_RUN) {
      await db.collection('contentposts').updateOne({ _id: doc._id }, { $set: { imageUrl } });
    }
  }

  console.log('\n--- summary ---');
  console.log(stats);
  if (DRY_RUN) console.log('(dry run — no writes made, no files uploaded)');

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
