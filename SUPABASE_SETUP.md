# Connecting Supabase — Setup Runbook

Wire the client's own Supabase account to The Farm 1893. ~15 minutes, one time.
Until this is done, the site + CRM keep running in demo mode; nothing breaks.

---

## 1. Create the project (in the client's Supabase account)
1. Sign in at [app.supabase.com](https://app.supabase.com) with the **client's** account.
2. **New project** → name it `the-farm-1893`, region **US East (Ohio) / us-east-2**, set a strong database password (save it).
3. Wait ~2 minutes for it to provision.

## 2. Create the database tables
1. In the project: **SQL Editor → New query**.
2. Paste the **entire** contents of **`supabase/schema.sql`** → **Run**.
   *(You should see "Success. No rows returned." It's one consolidated file with
   every table — including `dossiers` and `silo_listings` — plus row-level
   security. Safe to run more than once.)*

## 3. Grab the API keys
Project → **Settings → API**. Copy three values:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` *(secret — server only)*

## 4. Add them to Vercel
Vercel → the project → **Settings → Environment Variables**. Add all three
(scope: Production + Preview). The `service_role` key must **only** be the
`SUPABASE_SERVICE_ROLE_KEY` (never the `NEXT_PUBLIC_` ones).

For local development, put the same three in a **`.env.local`** file (see
`.env.example`). Never commit real keys.

## 5. Turn on staff login
1. Supabase → **Authentication → Providers** → make sure **Email** is enabled.
2. **Authentication → Users → Add user** → create the owner's account
   (email + password). Repeat for each staff member.
   *(Tip: turn OFF "Allow new users to sign up" so only invited staff get in.)*

## 6. Redeploy
Vercel → **Deployments → ⋯ → Redeploy** (so it picks up the new env vars).

## 7. Verify
- Visit `/dashboard` → you should be redirected to **`/login`** (it's now private).
- Sign in with the staff account → dashboard opens.
- Submit a test inquiry on the public site → it appears in your Supabase
  `leads` table (Table Editor).

---

## What turns on automatically once connected
- **Live CRM reads** — the pipeline, contacts, vendor network, bookings
  calendar, silo guests, dashboard KPIs, and client dossiers all read **real
  rows** from the database (they fall back to demo data only when the keys are
  absent). Empty tables show friendly "you're live" empty states and fill as
  real inquiries arrive.
- **Persistence** — every lead, silo booking, vendor, contact edit, dossier
  change (vendor team / payments / checklist), and silo-listing edit saves to
  the database.
- **A private dashboard** — `/dashboard` requires staff login; the mutation
  APIs require an authenticated staff user.
- **Shared data** — no longer per-browser; everyone sees the same records.

## What's next after this (optional phases)
- **Public silo pages from the DB** — the marketing silo pages are pre-rendered;
  point them at `silo_listings` so seller edits show to visitors too.
- Real-time updates (Supabase subscriptions) on the calendar + pipeline.
- Payments (Stripe/Helcim) + QuickBooks sync so deposits auto-log.
