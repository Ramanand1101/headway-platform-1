# Makeuforward Platform — How It Works

This document describes the platform **as it is actually built and deployed** right now — not the
original plan (see `multi-tenant-architecture.md` for the earlier design doc, which is now partly
outdated).

---

## 1. What this platform does

Each financial advisor gets their own personal-branding website at
`<their-slug>.trendtrooper.shop` — one shared codebase serves all of them. Adding a new advisor
means adding one database record; no new code or deploy is needed.

---

## 2. The moving pieces

| Piece | What it is | Where it lives |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Vercel project `headway-platform-jl7v` |
| Backend | Node.js + Express API | Vercel project `headway-platform` (separate deployment) |
| Database | MongoDB Atlas (`headwayTenant` DB, cluster `cluster0`) | MongoDB Atlas cloud |
| Domain | `trendtrooper.shop` | Registered on Hostinger, DNS delegated to Vercel |
| Code | GitHub repo | `github.com/Ramanand1101/headway-platform` |

Frontend and backend are **two separate Vercel projects** deployed from the same GitHub repo
(frontend from `/frontend`, backend from `/backend`). They talk to each other over HTTPS, not
directly — the frontend calls the backend's public URL like any other API consumer.

---

## 3. How a subdomain reaches the right advisor

```
Browser requests: ramanand.trendtrooper.shop/about
        │
        ▼
Vercel DNS (nameservers ns1/ns2.vercel-dns.com) routes it to the frontend project
        │
        ▼
frontend/middleware.js reads the Host header → extracts "ramanand" as the subdomain
        │
        ▼
Rewrites the request internally to /ramanand/about
        │
        ▼
app/[advisorSlug]/about/page.js runs, calls fetchAdvisorProfile("ramanand")
        │
        ▼
lib/api.js sends a request to the backend with header:
   x-tenant-host: ramanand.trendtrooper.shop
        │
        ▼
backend/src/middleware/resolveTenant.js splits that header on "." → slug "ramanand"
        │
        ▼
Looks up Advisor.findOne({ slug: "ramanand" }) in MongoDB → returns that advisor's data
```

Key files:
- [`frontend/middleware.js`](frontend/middleware.js) — subdomain → path rewrite
- [`frontend/lib/api.js`](frontend/lib/api.js) — sends the `x-tenant-host` header to the backend
- [`backend/src/middleware/resolveTenant.js`](backend/src/middleware/resolveTenant.js) — resolves that header to an `Advisor` document

**Bare domain vs. subdomain:** `trendtrooper.shop` (no subdomain) and `www.trendtrooper.shop` are
treated as "no advisor" and serve the company homepage (`app/page.js`) instead of being rewritten.

---

## 4. DNS / Domain setup (already done — for reference)

- Domain `trendtrooper.shop` bought on **Hostinger**.
- Nameservers changed from Hostinger's default to Vercel's:
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ```
  This means Vercel now fully controls DNS for this domain — Hostinger's own DNS records page is
  inactive/irrelevant now.
- In the **frontend** Vercel project → Settings → Domains, two entries exist:
  - `trendtrooper.shop` (the bare apex domain)
  - `*.trendtrooper.shop` (wildcard — covers every advisor subdomain automatically)
- Adding advisor #501 needs **zero DNS changes** — the wildcard already covers it.

---

## 5. How to add a new advisor

**Via the admin panel (recommended):**
1. Go to `https://trendtrooper.shop/admin/login`
2. Log in with an admin account (see §7)
3. Click **"Add advisor"** in the nav
4. Fill in slug, name, city, bio, contact/WhatsApp number, specialization, services
5. Submit — the advisor is live immediately at `<slug>.trendtrooper.shop`

**Via API directly** (e.g. for bulk import scripts):
```bash
curl -X POST https://headway-platform.vercel.app/api/advisor/onboard \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin JWT token>" \
  -d '{
    "slug": "priya",
    "name": "Priya Sharma",
    "city": "Mumbai",
    "specialization": ["Tax Planning", "Insurance"],
    "bio": "10+ years helping families plan their finances.",
    "services": ["Tax Saving", "Retirement Planning"],
    "contactNumber": "9876543210"
  }'
```
This endpoint is **admin-only** ([`backend/src/middleware/requireAdmin.js`](backend/src/middleware/requireAdmin.js)) — a valid JWT with `role: "admin"` is required, obtained via `POST /api/auth/login`.

Only `slug` and `name` are required; everything else is optional.

---

## 6. Admin accounts

- Admin login lives at `/admin/login` (same Next.js app, not subdomain-specific).
- `User` model has a `role` field: `advisor` (default) or `admin`. Only `admin` can onboard new
  advisors; `advisor` role is meant for an advisor's own self-service dashboard (approving their
  monthly AI-drafted content).
- **There is currently no self-serve way to create the first admin** — the `/api/auth/register`
  endpoint always creates `role: "advisor"` users; promoting to `admin` was done manually via a
  one-off script directly against MongoDB. If you need another admin account, that same manual
  step is needed (register normally, then flip `role` to `"admin"` in the `users` collection).
- Admin credentials created this session are in the chat history — change the password once
  there's a proper "change password" UI, since none exists yet.

---

## 7. Environment variables

### Frontend (`frontend/.env` locally, Vercel dashboard in production)
| Variable | Purpose | Gotcha |
|---|---|---|
| `NEXT_PUBLIC_BASE_DOMAIN` | Root domain (`trendtrooper.shop`) used to build the `x-tenant-host` header | Must be `NEXT_PUBLIC_` — read in both server and client code |
| `NEXT_PUBLIC_API_URL` | Backend's public URL | **Must** be `NEXT_PUBLIC_` — every page that calls the backend from the browser (login, dashboard, contact form, add-advisor form) is a `'use client'` component, and Next.js only exposes `NEXT_PUBLIC_*` vars to browser code. A plain `API_URL` silently becomes `undefined` client-side (this was a real bug that got fixed) |

### Backend (`backend/.env` locally, Vercel dashboard in production)
| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Signs admin/advisor login tokens |
| `PORT` | Local dev port only (Vercel ignores this, it's serverless) |
| `CLAUDE_API_KEY` | Used by `contentGenerator.js` for monthly AI content drafts |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Billing (currently stubbed, see `billingService.js`) |
| `BASE_DOMAIN` | Not actually used for tenant resolution (that's done by splitting the `Host`/`x-tenant-host` header directly) — mostly informational |

**Rule of thumb:** if an env var is read inside a file that has `'use client'` at the top, or inside
`lib/api.js` (which is called from client components too), it must be `NEXT_PUBLIC_`-prefixed.

---

## 8. Local development

```bash
# backend
cd backend && npm install && node src/app.js   # runs on PORT from .env

# frontend (separate terminal)
cd frontend && npm install && npx next dev -p 3000
```

To test subdomain routing locally (middleware only rewrites for known root domains, `localhost`
included by default):
```bash
curl http://localhost:3000/ -H "Host: ramanand.localhost:3000"
```
or add a real `/etc/hosts` entry (`127.0.0.1 ramanand.localhost`) and open
`http://ramanand.localhost:3000` in a browser.

---

## 9. Deploying changes

1. Commit and push to `main` on GitHub (both `frontend/` and `backend/` are in the same repo;
   Vercel is configured to build each project from its respective subfolder).
2. Vercel auto-deploys on push for both projects.
3. **Env var changes do NOT trigger a redeploy** — after changing anything in Vercel → Settings →
   Environment Variables, you must manually trigger **Redeploy** from the Deployments tab.

---

## 10. Known gaps / things not built yet

- No public advisor signup — onboarding is admin-only (by design, since accounts are paid/managed).
- No "forgot password" or "change password" flow for admin/advisor logins.
- Billing (`billingService.js`) is a stub — no real Razorpay integration wired up yet.
- Custom domain automation (`domainService.js`, for Premium-tier advisors bringing their own
  domain) is written but not connected to any UI flow.
- Only one admin account exists; there's no admin-management UI to create/revoke other admins.
