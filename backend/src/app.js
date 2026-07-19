require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const startMonthlyContentJob = require('./jobs/monthlyContentCron');

const advisorRoutes = require('./routes/advisorRoutes');
const contentRoutes = require('./routes/contentRoutes');
const billingRoutes = require('./routes/billingRoutes');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const siteBannerRoutes = require('./routes/siteBannerRoutes');
const siteContentRoutes = require('./routes/siteContentRoutes');
const leadRoutes = require('./routes/leadRoutes');
const instagramRoutes = require('./routes/instagramRoutes');
const facebookRoutes = require('./routes/facebookRoutes');

connectDB();

const app = express();

// Deployed behind the hosting platform's reverse proxy, which sets
// X-Forwarded-For — trust that one hop so express-rate-limit (and req.ip)
// see the real client IP instead of the proxy's.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api', publicLimiter);

app.use('/api/advisor', advisorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/site/banners', siteBannerRoutes);
app.use('/api/site/content', siteContentRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/advisor/instagram', instagramRoutes);
app.use('/api/advisor/facebook', facebookRoutes);

app.get('/', (req, res) => res.json({ message: 'Welcome to Makeuforward Platform' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

startMonthlyContentJob();

// Traditional hosting (local dev, Render, etc.) runs this file directly and
// needs a listening port. Vercel instead requires the app itself via
// api/index.js and invokes it as a serverless function per-request, so it
// must not bind a port.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
