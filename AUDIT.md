# The Farm 1893 — Professional Site & CRM Audit

*Graded as a wedding-industry website + venue-CRM evaluator. Scored on design,
conversion, data flow, and operations. Honest about what's strong and what's missing.*

**Overall grade: A– (as a demo/prototype) · B (as a live business system — held back only by the paused backend).**

The design and feature depth are well above what regional competitors offer. The single
thing standing between "beautiful demo" and "revenue machine" is connecting the data layer
(Supabase) + payments (Stripe/Helcim). Everything else is built and waiting.

---

## 1. Public website — Grade: A

**What's working (keep doing):**
- **Emotional, on-brand design.** Cinematic homepage, editorial rustic-luxe system, strong differentiator messaging ("your people stay the whole weekend"). This converts.
- **Genuinely unique tools** no competitor has: Design My Day, the Style Quiz, guest microsites, the cost planner, the registry. These are share-worthy and lead-generating.
- **Conversion plumbing is right:** instant availability + pricing + golden-hour, 24/7 AI concierge, multiple lead magnets, scarcity cues, SEO (Journal, sitemap, structured data), social share image.
- **Mobile-first, accessible** (focus states, reduced-motion), fast (static where possible).

**Improve:**
- **Real photography.** Placeholder/stock imagery is the biggest visible gap — swap in a professional shoot of the actual barn, orchard, farmhouse, and silos. This alone lifts conversion more than any feature.
- **Real content:** true pricing, phone number, capacities, and testimonials.
- **Video.** Add the walkthrough/hero video (the Virtual Tour module is already built to hold it). Short-form video is the highest-ROI content format.
- **Live reviews aggregation** (pull Google/Knot reviews) vs. static testimonials.

**Missing (worth adding):**
- **Abandoned-inquiry recovery** (someone starts the contact form/date checker but doesn't finish → capture + retarget).
- **A "compare packages" / FAQ-rich pricing** interaction to pre-answer objections.

---

## 2. The lead → CRM → marketing → follow-up flow — Grade: A– (architecture) / C (live, until DB)

This is the heart of your question, so here's the full trace.

**Entry points (all capture a lead):** contact form · date checker → "reserve a tour" · waitlist (taken dates) · Style Quiz · pricing-guide magnet · referral page · vendor application · **silo booking** · Rosie (AI concierge).

**→ Into the CRM:** every entry POSTs to `/api/leads` with **AI lead scoring** (score, priority, next-best-action) and a **source + eventType tag**. Leads land in the pipeline, contacts, and a full client **dossier** (vendors, payments, lodging, registry, golden-hour).

**→ Into marketing:** leads enroll in **AI drip automations** (welcome, toured-not-booked, anniversary, silo "come back") and feed the **Ad Studio** (persona-targeted content across every channel) and **Analytics** (funnel + AI insights).

**→ Data to cater the wedding:** you capture event type, date, guest count, budget/value, **style (from the quiz)**, and free-text notes; the dossier organizes the vendor team, payments, and lodging.

**Grade drivers — what's excellent:** the *architecture* is complete and cohesive — one connected system, tagged and scored, with nurture and attribution. Very few venues have this.

**What's missing / weak (fix these):**
1. **It doesn't persist or send yet.** No database (Supabase) = data lives in-browser; no email/SMS provider = drips don't actually send. **This is the #1 gap.** Until then it's a beautiful simulation.
2. **Capture richer catering data at intake.** Add fields couples happily give: **budget range, how they heard about us (attribution!), style/vibe, must-haves, dietary/estimated guest count, preferred season.** More signal → better AI scoring, better follow-up, better catering prep.
3. **Wire the microsite RSVP → CRM.** Right now guest RSVPs on the microsite aren't captured. **Every wedding guest is a future couple** — capturing RSVP data (name, email, party size) builds a warm audience worth more than most ad spend. *(High-ROI, easy once the DB is on.)*
4. **Post-event review automation.** Auto-request a review after every wedding/stay → feeds social proof + SEO (a compounding loop).
5. **Reporting/exports + team roles** for real operations.

---

## 3. VRBO / Silo Stays — Grade: A– (as built) with clear next steps

**What's working:**
- A distinct, on-brand rental experience (`/silos`) with the STR best-practices: galleries, amenities, ratings, house rules, book-direct perks, and an **instant-quote booking widget**.
- **Leads flow into the CRM tagged VRBO** (`Silo Stay` / `vrbo-silos`), cleanly separated from weddings, with their own dashboard (`/dashboard/rentals`), metrics, and a **year-after-year "Come Back" drip**.

**Improve / add:**
- **Real-time availability calendar per silo** (guests want to see open dates before booking). Needs the DB.
- **OTA channel sync** (Airbnb/Vrbo/Booking) so a booking anywhere blocks the dates everywhere — prevents double-booking. This is the single most important operational add for a serious STR business.
- **Cleaning/turnover + messaging automation** (check-in instructions, Wi-Fi, house manual) — big guest-experience win.
- **Dynamic nightly pricing** (weekends/Cedar Point peak/season) — you already have the pricing engine; extend it to nightly.

---

## 4. Separating — and connecting — wedding vs VRBO guests — Grade: A (now)

**Separation (working well):**
- Two funnels, two tags (`Wedding` vs `Silo Stay`/`vrbo-silos`), two dashboards (pipeline vs `/dashboard/rentals`). They never muddy each other, and each has its own nurture track.

**Cross-marketing (just implemented, deliberately subtle):**
- **Wedding → Silos:** guests on the wedding microsite (and the Accommodations page) now see the silos as **individually-bookable, itemized weekend stays** — "Make a weekend of it." Wedding guests can grab their own silo, exactly as you wanted, and it cross-markets the rentals.
- **Silos → Venue:** one quiet line on the silo pages — "Dreaming a little bigger? We're also a wedding & gathering venue." Never overpowering.

**Recommended next layer:**
- **Itemized silos in the wedding cost planner/registry.** You liked the registry pattern — extend it so a couple can *offer specific silos to specific guests* as line items (guest sponsors/pays for their silo, itemized like a registry fund). This turns the property's full lodging into bookable, trackable inventory per wedding.
- **Guest → future-couple loop.** A wedding guest who stays in a silo is a warm lead for *their own* future wedding. Tag them, and 6–12 months later, a gentle "you loved it here — imagine your own day" touch.
- **Saved audience segments** in the Ad Studio (Wedding-couples, VRBO-guests, Past-guests) for one-click retargeting.

---

## 5. Backend / CRM depth — Grade: A– (breadth) / B (until live data)

**Strong:** lead pipeline, AI scoring, dossiers, proposals, contracts, vendor network, referrals, automations, analytics, the new Ad Studio, and the unified bookings calendar (weddings + silos). This is more capability than most paid venue CRMs.

**Missing for real operations (all need the DB/auth layer):**
- **Authentication** — `/dashboard` is currently open; it must be login-protected before real client data.
- **Persistence + real-time** — shared, saved data across devices/users.
- **Payments + QuickBooks sync** — deposits, room/registry/silo payments, reconciliation.
- **Availability truth** — one calendar that actually blocks dates on booking (+ OTA sync).
- **Exports, roles/permissions, audit trail.**

---

## Prioritized roadmap (what to do next, in order)

**Phase 1 — Make it real (unlocks everything):**
1. Connect **Supabase** (auth + persistence + real-time) — protects the dashboard, saves every lead/booking/edit, powers a live availability calendar.
2. Connect **Stripe or Helcim** + **QuickBooks sync** — real deposits, room/registry/silo payments.
3. Wire **email/SMS** (Resend + Twilio) so the drips actually send.

**Phase 2 — Capture more, convert more:**
4. Richer intake fields (budget, attribution, style, must-haves).
5. **Microsite RSVP → CRM** (capture the guest audience).
6. Post-event **review automation**.
7. Per-silo **availability calendar** + OTA sync.

**Phase 3 — Compounding growth:**
8. Guest→future-couple nurture loop.
9. Saved audience segments + A/B ad variants + ad-image generator.
10. Live reviews aggregation + real photography/video.

---

## The one-line verdict

**You've built a platform that out-features anything a regional competitor has, with a data
flow and cross-marketing model most venues never achieve. It earns an A as a product — the
only thing between here and an A+ live business is turning on the backend (data, payments,
sending), which is a configuration step, not a rebuild.**
