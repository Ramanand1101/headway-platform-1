# Multi-Tenant Advisor Platform — Full Architecture
**Stack:** Next.js (Frontend) + Node.js/Express (Backend) + MongoDB — Pure JavaScript

---

## 1. Multi-Tenancy Strategy

**Approach: Shared Database, Shared Schema (tenant_id based isolation)**

Ek hi MongoDB database, ek hi collection set — har document mein `advisorId` field hota hai jo tenant ko isolate karta hai. 500 advisors ke liye ye sabse cost-effective aur maintainable approach hai (alag database per tenant sirf tab chahiye jab 5,000+ tenants ho ya strict compliance isolation chahiye ho).

**Tenant Resolution:** Subdomain-based
- `rajesh.headwayadvisors.com` → middleware `Host` header se `rajesh` slug nikalta hai → us advisor ka data serve hota hai
- Premium tier ke liye custom domain support (CNAME mapping) alag se add hota hai

---

## 2. High-Level Folder Structure

```
headway-platform/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection
│   │   ├── models/
│   │   │   ├── Advisor.js
│   │   │   ├── ContentPost.js
│   │   │   ├── Testimonial.js
│   │   │   ├── Billing.js
│   │   │   └── User.js
│   │   ├── middleware/
│   │   │   ├── resolveTenant.js       # slug/domain → advisor doc
│   │   │   ├── authenticate.js        # JWT verify
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── advisorController.js
│   │   │   ├── contentController.js
│   │   │   ├── billingController.js
│   │   │   └── authController.js
│   │   ├── routes/
│   │   │   ├── advisorRoutes.js
│   │   │   ├── contentRoutes.js
│   │   │   ├── billingRoutes.js
│   │   │   └── authRoutes.js
│   │   ├── services/
│   │   │   ├── contentGenerator.js    # Claude API integration
│   │   │   ├── billingService.js      # Razorpay integration
│   │   │   └── domainService.js       # SSL/subdomain automation
│   │   ├── jobs/
│   │   │   └── monthlyContentCron.js  # node-cron scheduled job
│   │   └── app.js
│   ├── .env
│   └── package.json
│
├── frontend/                   # Next.js
│   ├── middleware.js                  # Reads Host header, rewrites path
│   ├── app/
│   │   ├── [advisorSlug]/
│   │   │   ├── page.js                # Advisor homepage
│   │   │   ├── about/page.js
│   │   │   ├── services/page.js
│   │   │   ├── blog/page.js
│   │   │   └── contact/page.js
│   │   ├── admin/
│   │   │   ├── dashboard/page.js      # Advisor self-service panel
│   │   │   └── login/page.js
│   │   └── layout.js
│   ├── lib/
│   │   └── api.js                     # Fetch wrapper to backend
│   ├── components/
│   │   ├── AdvisorHero.js
│   │   ├── TestimonialCard.js
│   │   └── ContactForm.js
│   └── package.json
│
└── README.md
```

---

## 3. Database Design (MongoDB / Mongoose Schemas)

### Advisor.js (Core tenant document)
```javascript
const mongoose = require('mongoose');

const advisorSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true }, // "rajesh"
  customDomain: { type: String, default: null },                     // "rajeshfinance.com"
  name: { type: String, required: true },
  photoUrl: String,
  city: String,
  specialization: [String],           // ["Life Insurance", "Mutual Funds"]
  bio: String,
  services: [String],
  planTier: {
    type: String,
    enum: ['basic', 'standard', 'premium'],
    default: 'basic'
  },
  contactNumber: String,
  whatsappNumber: String,
  socialLinks: {
    linkedin: String,
    instagram: String,
    facebook: String
  },
  isActive: { type: Boolean, default: true },
  onboardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Advisor', advisorSchema);
```

### ContentPost.js
```javascript
const mongoose = require('mongoose');

const contentPostSchema = new mongoose.Schema({
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor', required: true, index: true },
  title: String,
  body: String,
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'published'],
    default: 'draft'
  },
  generatedBy: { type: String, enum: ['ai', 'manual'], default: 'ai' },
  publishedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('ContentPost', contentPostSchema);
```

### Billing.js
```javascript
const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor', required: true, index: true },
  razorpaySubscriptionId: String,
  planAmount: Number,
  status: {
    type: String,
    enum: ['active', 'pending', 'failed', 'cancelled'],
    default: 'pending'
  },
  nextBillingDate: Date,
  lastPaymentDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
```

### User.js (login for advisor's admin dashboard)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  advisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advisor', required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['advisor', 'admin'], default: 'advisor' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```

---

## 4. Backend — Tenant Resolution Middleware

Ye sabse important piece hai — har request pe advisor ko identify karta hai.

```javascript
// middleware/resolveTenant.js
const Advisor = require('../models/Advisor');

async function resolveTenant(req, res, next) {
  try {
    const host = req.headers['x-tenant-host'] || req.headers.host;
    // e.g. "rajesh.headwayadvisors.com" -> slug = "rajesh"
    const slug = host.split('.')[0];

    const advisor = await Advisor.findOne({
      $or: [{ slug }, { customDomain: host }],
      isActive: true
    });

    if (!advisor) {
      return res.status(404).json({ error: 'Advisor site not found' });
    }

    req.advisor = advisor; // attach tenant to request
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = resolveTenant;
```

## 5. Backend — Sample Route + Controller

```javascript
// routes/advisorRoutes.js
const express = require('express');
const router = express.Router();
const resolveTenant = require('../middleware/resolveTenant');
const { getAdvisorProfile, getAdvisorContent } = require('../controllers/advisorController');

router.get('/profile', resolveTenant, getAdvisorProfile);
router.get('/content', resolveTenant, getAdvisorContent);

module.exports = router;
```

```javascript
// controllers/advisorController.js
const ContentPost = require('../models/ContentPost');

exports.getAdvisorProfile = (req, res) => {
  res.json({ advisor: req.advisor });
};

exports.getAdvisorContent = async (req, res) => {
  const posts = await ContentPost.find({
    advisorId: req.advisor._id,
    status: 'published'
  }).sort({ publishedAt: -1 });
  res.json({ posts });
};
```

## 6. Backend — app.js (Entry Point)

```javascript
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const advisorRoutes = require('./routes/advisorRoutes');
const contentRoutes = require('./routes/contentRoutes');
const billingRoutes = require('./routes/billingRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/advisor', advisorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/auth', authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 7. Frontend — Next.js Tenant Routing

`middleware.js` reads the subdomain and rewrites the path internally to `/[advisorSlug]`:

```javascript
// middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  const host = req.headers.get('host');
  const subdomain = host.split('.')[0];

  // Skip for main domain / www / localhost
  if (['www', 'headwayadvisors', 'localhost:3000'].includes(subdomain)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
```

Advisor page fetches data server-side (SSR/ISR) using the slug:

```javascript
// app/[advisorSlug]/page.js
async function getAdvisorData(slug) {
  const res = await fetch(`${process.env.API_URL}/api/advisor/profile`, {
    headers: { 'x-tenant-host': `${slug}.headwayadvisors.com` },
    next: { revalidate: 3600 } // ISR: refresh every hour
  });
  return res.json();
}

export default async function AdvisorPage({ params }) {
  const { advisor } = await getAdvisorData(params.advisorSlug);

  return (
    <main>
      <h1>{advisor.name}</h1>
      <p>{advisor.bio}</p>
      {/* Hero, services, testimonials, contact form components */}
    </main>
  );
}
```

---

## 8. Automation Layer

| Task | Tool | Trigger |
|---|---|---|
| Monthly content draft | Claude API + `node-cron` | 1st of every month |
| Billing auto-charge | Razorpay Subscriptions webhook | On due date |
| New advisor site live | Auto on DB insert (no deploy needed) | On onboarding form submit |
| SSL for custom domain | Vercel Domains API | On premium tenant added |

```javascript
// jobs/monthlyContentCron.js
const cron = require('node-cron');
const Advisor = require('../models/Advisor');
const { generateContent } = require('../services/contentGenerator');

cron.schedule('0 0 1 * *', async () => {
  const advisors = await Advisor.find({ isActive: true });
  for (const advisor of advisors) {
    await generateContent(advisor); // calls Claude API, saves as 'pending_review'
  }
});
```

---

## 9. Deployment

| Component | Platform | Why |
|---|---|---|
| Frontend (Next.js) | **Vercel** | Wildcard subdomains, auto SSL, edge middleware native support |
| Backend (Node.js) | **Render / Railway** | Simple Node deploys, cron jobs, env management |
| Database | **MongoDB Atlas** | Managed, free tier sufficient to start, scales easily |

---

## 10. Build Phases

**Phase 1 (MVP — 2-3 weeks):**
- Advisor CRUD + onboarding form
- Subdomain routing (frontend + backend)
- Static profile page template (name, bio, services, contact)
- Manual billing (no Razorpay yet)

**Phase 2 (Scale — next 3-4 weeks):**
- Claude API auto content generation + review workflow
- Razorpay subscription billing
- Advisor admin dashboard (edit own content)
- Custom domain support for Premium tier

**Phase 3 (Growth):**
- WhatsApp notification integration
- Analytics per advisor (page views, lead form submissions)
- Referral/testimonial collection automation

---

## Security Checklist
- JWT-based auth for advisor dashboard login
- Rate limiting on public API routes (`express-rate-limit`)
- Input sanitization on all form submissions (`express-validator`)
- MongoDB field-level access control (advisor can only query own `advisorId`)
- HTTPS enforced everywhere (Vercel + Atlas handle this by default)
