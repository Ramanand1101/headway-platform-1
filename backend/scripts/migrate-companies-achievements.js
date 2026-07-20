// One-off migration: companiesWorkedWith went from [String] to
// [{ name, logoUrl }], and achievements went from [{ value, label }] to
// [{ imageUrl, name, description }]. Rewrites any advisor docs still on the
// old shape so existing data survives the schema change instead of being
// silently dropped when Mongoose casts it on read.
//
// Usage: node scripts/migrate-companies-achievements.js [--dry-run]
require('dotenv').config();
const mongoose = require('mongoose');

const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.db.collection('advisors');

  const advisors = await collection
    .find({}, { projection: { companiesWorkedWith: 1, achievements: 1 } })
    .toArray();

  let companiesChanged = 0;
  let achievementsChanged = 0;

  for (const advisor of advisors) {
    const update = {};

    if (Array.isArray(advisor.companiesWorkedWith) && advisor.companiesWorkedWith.some((c) => typeof c === 'string')) {
      update.companiesWorkedWith = advisor.companiesWorkedWith.map((c) =>
        typeof c === 'string' ? { name: c, logoUrl: '' } : c
      );
      companiesChanged += 1;
    }

    if (
      Array.isArray(advisor.achievements) &&
      advisor.achievements.some((a) => a && typeof a === 'object' && !('name' in a) && ('value' in a || 'label' in a))
    ) {
      update.achievements = advisor.achievements.map((a) => {
        if (a && typeof a === 'object' && !('name' in a)) {
          return {
            imageUrl: '',
            name: a.label || a.value || '',
            description: [a.value, a.label].filter(Boolean).join(' — ')
          };
        }
        return a;
      });
      achievementsChanged += 1;
    }

    if (Object.keys(update).length === 0) continue;

    console.log(`${DRY_RUN ? '[dry-run] ' : ''}advisor ${advisor._id}:`, update);
    if (!DRY_RUN) {
      await collection.updateOne({ _id: advisor._id }, { $set: update });
    }
  }

  console.log(
    `\nDone. ${companiesChanged} advisor(s) with companiesWorkedWith migrated, ${achievementsChanged} advisor(s) with achievements migrated.${DRY_RUN ? ' (dry run — no writes made)' : ''}`
  );
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
