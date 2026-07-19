const cron = require('node-cron');
const Advisor = require('../models/Advisor');
const { generateContent } = require('../services/contentGenerator');

// Runs at 00:00 on the 1st of every month
function startMonthlyContentJob() {
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly content generation job...');
    const advisors = await Advisor.find({ isActive: true });

    for (const advisor of advisors) {
      try {
        await generateContent(advisor);
      } catch (err) {
        console.error(`Content generation failed for ${advisor.slug}:`, err.message);
      }
    }
  });
}

module.exports = startMonthlyContentJob;
