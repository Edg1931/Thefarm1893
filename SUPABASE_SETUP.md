# Go-Live Runbook — connecting Supabase (and friends)

Wire the client's own Supabase account to The Farm 1893. **~20 minutes, one time.**

Until this is done the site and CRM run in **demo mode** — everything works, backed by
sample data. Nothing breaks while you wait, and nothing here is destructive.

> **Read step 5 before you redeploy.** Once the keys are live the dashboard requires a
> login, so the staff user has to exist first or you'll lock yourself out.

---

## 1. Environment variables

All of these go in **Vercel → your project → Settings → Environment Variables**
(scope: **Production**, and Preview if you use preview deploys).

### From Supabase — Project Settings → API

| Copy this | Into this variable | Notes |
|---|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` | e.g. `https://abcdefgh.supabase.co` |
| **anon** / **public** key<br>*(newer projects: **publishable**)* | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Safe in the browser — RLS protects it |
| **service_role** key<br>*(newer projects: **secret**)* | `SUPABASE_SERVICE_ROLE_KEY` | 🔒 **Server-only. Bypasses RLS entirely.** Never expose it |

⚠️ **Don't rename these.** The `NEXT_PUBLIC_` prefix tells Next.js to bundle the value into
the browser. The service-role key deliberately has **no** prefix so it can never leave the
server. Swapping them would publish your master database key.

### Secrets you generate yourself

These don't come from anywhere — they're just long random strings.

| Variable | What it protects |
|---|---|
| `PORTAL_TOKEN_SECRET` | Signs every private link: couple portals (`/portal/…?t=`), guest check-in (`/checkin/…`), and e-signature links (`/sign/…`). Verifying that signature is what binds a link to one specific booking. |
| `CRON_SECRET` | Guards the scheduled jobs (`/api/reminders`, `/api/automations/tick`). Vercel Cron sends it automatically; the routes reject anything without it. |

Generate each with:

```bash
openssl rand -base64 48
```

- **`PORTAL_TOKEN_SECRET` is not optional in production.** If it's unset the code falls back
  to a built-in development default — meaning anyone who knows that default could forge a
  link to any couple's portal.
- **Rotating `PORTAL_TOKEN_SECRET` invalidates every outstanding link.** Any portal,
  check-in, or signing link already sent to a couple stops working and must be re-issued.
  Set it once, before real links go out, then leave it alone.
- `CRON_SECRET` is safe to rotate any time — nothing persists across it.

---

## 2. Create the database tables

**Supabase → SQL Editor → New query** → paste the **entire** contents of
**`supabase/schema.sql`** → **Run**.

Expect *"Success. No rows returned."* It's one consolidated file — every table, plus
row-level security — and it's **idempotent**, so re-running it is safe and won't touch
existing data.

## 3. Seed the baseline rows

Same place, now run **`supabase/seed.sql`**.

This is **not optional**: it creates the property and the five bookable **resources**
(`venue` + the four silos). The availability engine keys off those slugs, so without them
the calendar has nothing to check against. It also adds starter inventory, maintenance
assets, and the four automation rules. Also idempotent.

Verify:

```sql
select slug, kind from resources order by kind, slug;   -- expect 5 rows
```

## 4. Storage buckets

- **`Photos`** — already exists (public). This is where the marketing photography lives.
- **`documents`** — create it: **Storage → New bucket** → name it exactly `documents` →
  leave **Public unchecked**.

The `documents` bucket holds contracts, invoices, insurance certificates, and couple
uploads. It must stay **private** — the app serves those files through short-lived signed
URLs, never public links.

## 5. Create staff logins ⚠️ do this before redeploying

1. **Authentication → Providers** → confirm **Email** is enabled.
2. **Authentication → Users → Add user** → enter the owner's email and password, and turn
   on **Auto Confirm** (otherwise they can't sign in until they click a confirmation email).
3. Copy the new user's **UUID**, then run this in the SQL Editor — once per staff member:

```sql
insert into staff (user_id, name, role, permissions, hourly_rate, active)
values ('PASTE-AUTH-USER-UUID', 'Rachel', 'Owner', '{all}', 0, true);
```

`permissions` is a Postgres text array: `'{all}'` for an owner, or something scoped like
`'{operations,bookings}'` for a team lead.

Without the matching `staff` row, login works but permissions, the time clock, and payroll
reporting have nothing to attach to.

> 💡 Also turn **off** "Allow new users to sign up" (Authentication → Sign In / Providers)
> so only invited staff can get in.

## 6. Redeploy

Vercel → **Deployments → ⋯ → Redeploy**. Environment variables only take effect on a new
build, so nothing changes until you do this.

## 7. Verify

Open **Dashboard → Integrations**. The **Database health** panel checks the real database
and reports:

| Row | Green means |
|---|---|
| Database connection | Connected — the CRM is reading and writing real rows |
| Bookable resources seeded | All 5 resources present (step 3 worked) |
| Private documents bucket | The `documents` bucket exists (step 4) |
| Staff accounts linked | At least one `staff` row (step 5) |
| Live data | Current lead and booking counts |

Anything amber tells you exactly which step is outstanding. Then:

- Visit `/dashboard` → you should be bounced to **`/login`** (it's private now).
- Sign in → the dashboard opens.
- Submit a test inquiry on the public site → it lands in the `leads` table.

---

## What switches on automatically

- **Live CRM** — pipeline, contacts, vendors, bookings calendar, silo guests, KPIs, and
  client dossiers all read real rows instead of sample data.
- **Real availability** — one engine across weddings and silo stays; conflicting dates are
  rejected rather than double-booked.
- **Private portals** — couple, vendor, and guest check-in surfaces start enforcing access.
  Staff can mint a signed client link from **Dashboard → Client Portal → Copy secure portal
  link** (no account needed for the couple).
- **Shared data** — no longer per-browser; everyone sees the same records.

---

## Optional integrations

Each is independent. Add the key, redeploy, and that feature flips from its built-in mock
to live — no code changes.

| Service | Variables | Unlocks |
|---|---|---|
| **Anthropic** | `ANTHROPIC_API_KEY` (optional `AI_MODEL`) | Live AI for Rosie, lead scoring, reply drafts, proposals, marketing copy |
| **Resend** | `RESEND_API_KEY`, `EMAIL_FROM`, `NOTIFY_EMAIL` | Actually sends invoices, receipts, reminders, magic links — **and new-lead alerts to `NOTIFY_EMAIL`** |
| **Twilio** (inbound SMS) | *none required* — optionally `TWILIO_ACCOUNT_SID` | Rosie answers texts 24/7. **Setup is just the webhook:** point your Twilio number's *"A message comes in"* to `https://<your-domain>/api/sms`. The app replies with TwiML, so Twilio handles delivery and no API keys are needed. `TWILIO_ACCOUNT_SID` only flips the status readout to "live" |
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | **Deliberately deferred.** Until added, checkout/invoices run in demo mode and no card is ever charged |

`EMAIL_FROM` must be a domain you've verified in Resend, e.g.
`The Farm 1893 <hello@thefarm1893.com>`.

See **`.env.example`** for the full annotated list, including calendar OAuth and OTA sync.

### Known limits (so nothing surprises you)

- **Outbound SMS isn't wired yet.** Rosie replies to *incoming* texts, but the automation
  engine currently dispatches **email only** — any SMS step in a sequence won't send. Email
  automations work fully.
- **The SMS webhook doesn't verify Twilio's signature.** Anyone who finds the URL could POST
  to it and get AI replies, which spends Anthropic credits. Low risk while the URL is
  unpublished; worth adding signature validation before promoting the number widely.

---

## Content still to replace

Separate from the database, some marketing copy is still placeholder. The site guards
against it — the sample phone number renders as plain text rather than a dead tap-to-call
link, and the invented review rating is withheld from Google's structured data.

Check **Dashboard → Integrations → "Content to replace before launch"** for the live list.
Everything lives in **`lib/content.ts`**; flip the matching entry in `contentStatus` to
`"real"` and the warning and its guard disappear.

## Troubleshooting

| Symptom | Cause |
|---|---|
| Dashboard still shows demo data | Env vars added but not redeployed (step 6) |
| Locked out of `/dashboard` | No staff auth user yet — create one in Supabase (step 5) |
| Calendar can't find dates | `seed.sql` not run — no `resources` rows (step 3) |
| Portal/check-in links rejected | `PORTAL_TOKEN_SECRET` changed after the links were sent |
| Document uploads fail | `documents` bucket missing or not private (step 4) |
