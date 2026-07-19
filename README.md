# Headway Multi-Tenant Advisor Platform

Full-stack starter: **Next.js** (frontend) + **Node.js/Express** (backend) + **MongoDB**.
One codebase serves every advisor's website via subdomain routing —
`rajesh.headwayadvisors.com`, `priya.headwayadvisors.com`, etc.

## Folder structure

```
headway-platform/
├── backend/     Node.js + Express API, MongoDB models, cron jobs
└── frontend/    Next.js app, subdomain middleware, advisor pages
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, CLAUDE_API_KEY, Razorpay keys
npm run dev
```

Runs on `http://localhost:5000`. Health check: `GET /health`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set API_URL to your backend URL
npm run dev
```

Runs on `http://localhost:3000`.

### 3. Local subdomain testing

Add to your `/etc/hosts` (or Windows equivalent):
```
127.0.0.1  rajesh.localhost
```
Then visit `http://rajesh.localhost:3000` — middleware.js rewrites this to `/rajesh`.

## Creating your first advisor

```bash
curl -X POST http://localhost:5000/api/advisor/onboard \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "rajesh",
    "name": "Rajesh Kumar",
    "city": "Lucknow",
    "specialization": ["Life Insurance", "Mutual Funds"],
    "bio": "12+ years helping families plan their financial future.",
    "services": ["Term Insurance", "SIP Planning", "Retirement Planning"],
    "contactNumber": "+91XXXXXXXXXX"
  }'
```

Then visit their site at `rajesh.localhost:3000`.

## What's already built (MVP skeleton)

- Advisor onboarding + profile CRUD
- Subdomain-based tenant resolution (backend middleware + Next.js rewrite)
- Public advisor site: home, about, services, blog, contact
- Advisor login + dashboard to approve AI-drafted content
- Monthly content generation cron (Claude API) — plug in your `CLAUDE_API_KEY`
- Billing scaffold for Razorpay subscriptions — plug in real SDK calls in `billingService.js`

## What you still need to wire up before production

- Real Razorpay SDK calls in `services/billingService.js` (currently stubbed)
- Webhook signature verification for `/api/billing/webhook`
- Vercel Domains API token for custom domains (`services/domainService.js`)
- A `/api/leads` route + model if you want to store contact-form submissions (referenced in `ContactForm.js`)
- Production `.env` values and a deployed MongoDB Atlas cluster

## Deployment

| Component | Suggested platform |
|---|---|
| Frontend | Vercel (native wildcard subdomain + SSL support) |
| Backend | Render or Railway |
| Database | MongoDB Atlas |

See `multi-tenant-architecture.md` (shared earlier) for the full architecture writeup, diagrams, and phased roadmap.
