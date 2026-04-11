# The Artisanal Hearth — Full-Stack Deployment Guide

## Stack
- **Frontend**: Vanilla JS + Tailwind CSS (SPA)
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Render
- **Auth**: JWT (admin panel)
- **Security**: Helmet · CORS · Rate Limiting · express-validator · XSS sanitization · Honeypot

---

## Step 1 — Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `artisanal-hearth`, choose a strong DB password, select a region close to India (Singapore)
3. Once created: **Settings → API** → copy:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` secret key → `SUPABASE_SERVICE_KEY` (NOT the anon key)
4. Go to **SQL Editor** → paste contents of `supabase/schema.sql` → **Run**

---

## Step 2 — Generate Admin Password Hash

```bash
npm install
npm run build:css:prod
node -e "const b=require('bcryptjs'); b.hash('YourSecurePassword123!', 12).then(console.log)"
```

Copy the printed hash — this is your `ADMIN_PASS_HASH`.

---

## Step 3 — Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New Web Service** → connect your repo
3. Render will detect `render.yaml` automatically
4. In **Environment Variables**, set:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | From Step 1 |
| `SUPABASE_SERVICE_KEY` | From Step 1 |
| `ADMIN_EMAIL` | e.g. `admin@artisanalhearth.in` |
| `ADMIN_PASS_HASH` | bcrypt hash from Step 2 |
| `ALLOWED_ORIGINS` | `https://your-app.onrender.com` |

5. Click **Create Web Service** — Render auto-deploys on every push

---

## Step 4 — Access Admin Panel

Visit your deployed URL and press **Ctrl + Shift + A** to open the admin panel, or navigate directly to `/#admin`.

Default dev credentials (change in production):
- Email: `admin@artisanalhearth.in`
- Password: `admin123`

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| XSS Prevention | `escHtml()` for all dynamic content; `xss` package on backend |
| SQL Injection | Supabase parameterized queries (never raw SQL with user input) |
| Rate Limiting | 100 req/15min general; 10 req/15min login; 20 req/10min orders |
| Input Validation | `express-validator` (backend) + regex (frontend) |
| Security Headers | `helmet` — CSP, HSTS, X-Frame-Options, etc. |
| CORS | Whitelist-only origins |
| JWT Auth | Admin panel, 8h expiry, in-memory only (no localStorage) |
| Honeypot Fields | Bot trap on reservation and contact forms |
| Payload Limit | 10KB max request body |
| RLS (DB level) | Supabase Row Level Security — public can INSERT only |

---

## Local Development

```bash
cp .env.example .env
# Fill in your .env values
npm install
npm run dev
# Visit http://localhost:3000
```
