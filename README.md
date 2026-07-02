# The Farm 1893 — Website + AI-Powered Venue OS

A conversion-focused marketing website **and** an AI-powered CRM ("Venue OS") for
**The Farm 1893**, a historic-orchard wedding & gathering venue in Berlin Heights, Ohio.

One connected system: the public site captures leads → the CRM scores, tracks, and
nurtures them → AI powers insights, marketing content, and a 24/7 receptionist.

---

## ✨ What's built

### Public marketing site (`/`)
Cinematic, editorial, mobile-first — designed to keep couples engaged and convert them.

| Page | Highlights |
|------|-----------|
| `/` Home | Full-bleed hero, scroll-reveal storytelling, spaces, the signature weekend, gallery, testimonials, packages, live date-checker |
| `/venue` | The four spaces + amenities |
| `/weddings` | All-in-one story, packages, availability |
| `/gatherings` | Corporate, milestones, celebrations of life |
| `/accommodations` | The farmhouse (sleeps 25) |
| `/gallery` | Masonry gallery with lightbox |
| `/pricing` | Transparent packages + FAQ + sticky date-checker |
| `/about` | The 1893 legacy timeline |
| `/contact` | Lead form (AI-scored) + map + info |

**Conversion features:** real-time availability checker, instant AI lead scoring,
a floating **AI concierge chat ("Rosie")** available on every page, prominent social proof,
and click-to-call.

### AI-Powered CRM — "Venue OS" (`/dashboard`)
| Section | What it does |
|---------|--------------|
| **Overview** | KPIs, revenue chart, AI insight cards, hot-leads table with next-best-actions |
| **Lead Pipeline** | Drag-and-drop kanban (New → Toured → Proposal → Booked → Lost), AI scores per card |
| **Bookings & Calendar** | Month calendar + event list, confirmed/tentative/tour states |
| **Contacts** | Enriched contact table with scores & one-click outreach |
| **AI Marketing Studio** | Generate on-brand Instagram / email / ad / blog content, content calendar, best-time-to-post insights |
| **AI Receptionist** | Live test chat, persona config, 24/7 settings, auto-logged conversation history |
| **Integrations** | Live status of every pluggable service |

---

## 🔌 Pluggable-by-design

Every external service is optional. **Leave a key blank and the app runs in smart demo
mode; add a key and the feature goes live — no code changes.**

| Service | Powers | Env |
|---------|--------|-----|
| Supabase | Database + auth for the whole CRM | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| Anthropic Claude | Rosie, lead scoring, insights, marketing copy | `ANTHROPIC_API_KEY` |
| Twilio | AI receptionist **phone line** | `TWILIO_*` |
| Stripe | Deposits & invoices | `STRIPE_*` |
| Meta / Instagram | Social auto-posting | `META_ACCESS_TOKEN` |
| Resend | Auto-emails & alerts | `RESEND_API_KEY` |

All wiring lives in one place: **`lib/services/`** (`ai.ts`, `receptionist.ts`, `insights.ts`).

---

## 🚀 Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys as you get them (all optional to start)
npm run dev                  # http://localhost:3000  ·  CRM at /dashboard
```

**Connect the database (optional):** create a Supabase project, run
`supabase/migrations/0001_init.sql` in the SQL editor, and add the URL + keys to `.env.local`.
The lead form and CRM will persist to Postgres automatically.

**Turn on real AI:** add `ANTHROPIC_API_KEY`. Rosie and the Marketing Studio upgrade from
the built-in mocks to full Claude output instantly.

---

## 🧱 Stack & structure

- **Next.js 15** (App Router) · **React 19** · **TypeScript** · **Tailwind v4**
- **Supabase** (Postgres) · **Anthropic Claude** · deploy on **Vercel**

```
app/
  (marketing pages)            # /, /venue, /weddings, /pricing, /contact, …
  dashboard/                   # Venue OS CRM
  api/                         # receptionist, leads, availability, marketing
components/site/               # Header, Footer, Hero, DateChecker, LeadForm, ReceptionistWidget
components/crm/                # Sidebar, widgets, PipelineBoard, MarketingStudio, ReceptionistConsole
lib/
  content.ts                  # ← all site copy & placeholder data (swap real details here)
  services/                   # pluggable AI / receptionist / insights
  crm/sample-data.ts          # demo CRM records
supabase/migrations/          # database schema
```

## 🎨 Design language
Rustic-refined, inspired by the sketched-barn logo and the 1893 orchard: warm cream + soft
black, orchard-green and aged-brass accents, editorial serif (Cormorant Garamond) with a
script flourish (Great Vibes) and clean Inter UI.

---

## 📋 Roadmap (next phases)
- Supabase Auth for staff login on `/dashboard`
- Live Twilio voice for the phone receptionist
- Stripe deposit collection inside bookings
- Automated email nurture sequences
- Real social publishing + analytics ingestion
- Digital contracts / e-signatures

> **Note:** All pricing, photos, phone number, and copy are polished **placeholders**.
> Swap real content in `lib/content.ts` (site) and connect Supabase for live CRM data.
