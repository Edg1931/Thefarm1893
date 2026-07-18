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
2. Paste the contents of **`supabase/migrations/0001_init.sql`** → **Run**.
3. New query → paste **`supabase/migrations/0002_venue_expansion.sql`** → **Run**.
   *(You should see "Success". These only CREATE tables — safe to re-run.)*

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
- **Persistence** — every lead, silo booking, vendor, contact edit, and
  registry gift saves to the real database (the app already writes to these).
- **A private dashboard** — `/dashboard` requires staff login.
- **Shared data** — no longer per-browser; everyone sees the same records.

## What's next after this (optional phases)
- Migrate the CRM's read views from sample data to live queries (so the tables,
  pipeline, and calendar show real records).
- Real-time updates + a live availability calendar.
- Payments (Stripe/Helcim) + QuickBooks sync.

Ping me when the keys are in and I'll switch the CRM read-views over to live data.
