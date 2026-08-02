// One-off fix: the live homepage renders SiteContent(page:'homepage').data
// if that document exists in Mongo, falling back to
// frontend/lib/homepageContent.js's defaults only when it doesn't. An
// admin previously saved the homepage via /admin/homepage, which persisted
// the OLD pricing (₹500/₹1,000/₹2,000, flat-10-credit copy) — so updating
// the defaults in code had no visible effect on the live site; the stored
// override always wins. This overwrites just the stored `pricing` block
// with the current correct values so the code and the live site agree.
//
// Usage: node scripts/sync-homepage-pricing.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');

const DRY_RUN = process.argv.includes('--dry-run');

const pricing = {
  eyebrow: 'Credits and Recharge Plans',
  heading: 'Start free. Recharge only when you post.',
  paragraph:
    'Credits are only spent when you actually share or download content — previewing is always free. An image costs 10 credits, a carousel 20 credits and a reel 30 credits.',
  plans: [
    {
      name: 'Starter',
      amount: '₹249',
      credits: '50 Credits',
      bonus: '',
      features: ['Good for 5 image posts', 'Personalised with your identity']
    },
    {
      name: 'Growth',
      amount: '₹499',
      credits: '110 Credits',
      bonus: '',
      features: ['Mix of images, carousels or reels', 'Priority content requests']
    },
    {
      name: 'Authority',
      amount: '₹999',
      credits: '220 Credits',
      bonus: '',
      features: ['Daily visibility, always-on presence', 'Monthly posting calendar included']
    }
  ],
  note: 'Credits are charged per content type, only when you share or download: image = 10 credits, carousel = 20 credits, reel = 30 credits. Need more any time? Top up 50 extra credits for ₹249.',
  domainCrossSell: {
    title: 'Want your own domain? (www.yourname.com)',
    desc: 'Registration, DNS setup, SSL and connection to your microsite — fully handled for you',
    price: '₹6,000 one-time'
  }
};

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.db.collection('sitecontents');

  const existing = await collection.findOne({ page: 'homepage' });
  if (!existing) {
    console.log('No homepage SiteContent document found — nothing to sync (live site already uses code defaults).');
    await mongoose.disconnect();
    return;
  }

  console.log('Current stored pricing.heading:', existing.data?.pricing?.heading);
  console.log('Current stored plan amounts:', (existing.data?.pricing?.plans || []).map((p) => p.amount));

  if (!DRY_RUN) {
    await collection.updateOne({ page: 'homepage' }, { $set: { 'data.pricing': pricing } });
    console.log('Updated stored pricing to match current code defaults.');
  } else {
    console.log('(dry run — no writes made)');
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
