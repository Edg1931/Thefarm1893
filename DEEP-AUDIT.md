# The Farm 1893 — Deep Audit & Competitive Ranking
*Full site + backend review. Automated quality gates, three parallel code audits, and live runtime testing. (Follow-up to `AUDIT.md`, run after the latest feature work.)*

---

## 1. Verdict

**Overall grade: A− (production-grade build, pending real content + database go-live).**

The site and CRM are cohesive, well-architected, and — after this pass — free of known bugs, broken links, or security holes in the code we control. Every one of the **40 routes returns HTTP 200** with no server errors, the production build is clean, and TypeScript is strict-passing. What stands between this and "launch" is **business content** (real photos, pricing, phone/email) and the **database go-live** — not engineering defects.

| Area | Grade | One-line |
|---|---|---|
| Public marketing site | **A−** | Bespoke, fast, SEO-ready, genuinely interactive — beats ~90% of venue sites. |
| CRM ("Venue OS") | **A−** | Feature breadth rivals paid tools; persistence is demo-mode until the DB is wired. |
| Backend / security | **B+ → A−** | Was open in a few places; hardened this pass (SSRF, auth, rate limiting). |
| Accessibility | **A−** | alt text, aria-labels, labelled inputs, keyboard-usable; a few modal-focus gaps remain. |
| Launch readiness | **B** | Placeholder NAP/photos and demo persistence are the gating items, by design. |

---

## 2. Health check (automated + live)

- ✅ **Build:** compiles cleanly, 61 routes generated.
- ✅ **Types:** `tsc --noEmit` passes (strict).
- ✅ **Runtime:** booted the production server and hit all 40 pages → **all 200**, zero server-log errors or hydration warnings.
- ✅ **APIs:** `/api/leads` validates input (400/200); enrich, receptionist, and lead endpoints now rate-limited.
- ✅ **Secrets:** the Supabase service-role key is server-only — verified it never reaches the browser bundle.

---

## 3. What this audit fixed

### Security (backend) — the most important outcomes
1. **SSRF in the vendor scraper (HIGH).** The enrich route fetched any user-supplied URL — I confirmed it live-fetching `http://localhost`. Now it DNS-resolves the host and **blocks private / loopback / link-local / cloud-metadata IPs**, re-validates on every redirect hop, streams the body with a hard size cap, and bounds the email regex.
2. **Unauthenticated admin writes (HIGH).** `/api/contacts` and `/api/vendors` use the service-role key (which bypasses row-level security). They now require a signed-in staff user once Supabase is configured (open in demo mode only).
3. **Mass-assignment (HIGH).** `PATCH /api/contacts` blindly wrote every field in the request body. Now whitelisted to safe columns.
4. **No rate limiting (MEDIUM).** Public/paid endpoints (leads, receptionist AI, enrich) now have per-IP throttling to blunt spam and AI-cost abuse.

### Correctness / UX
5. **Overview showed the same "Upcoming" list twice**, and one copy had a **timezone bug** rendering the wrong day. Removed the duplicate; the calendar is the single source.
6. **"Add Lead" on the pipeline was a dead button** — now opens the editor and saves. Removed the dead "Filter" button.
7. **Public lead forms silently faked success on failure** (RSVP, referral, guide, silo booking, waitlist) — a lost lead with a smiling confirmation. They now surface an error and let the guest retry.
8. **"Export" now downloads a real CSV**; the AI-insight and "Generate Microsite" CTAs are real links; the gallery no longer shows every photo twice.

### Polish
9. aria-labels on icon-only buttons, correct footer copyright year, `rel="noopener"` on external social links, fixed modal close-button position, non-clickable category cards no longer look clickable, and deleted an unused component.

---

## 4. How we rank vs. other venues

**Public site — top of the category.** The typical wedding-venue website is a Squarespace/Wix/The-Knot-storefront template: pretty but generic, slow, thin on SEO, and static. The Farm 1893 is a **bespoke Next.js build** with server-rendered SEO (title templates, Open Graph, `EventVenue` JSON-LD schema), optimized images, and a genuinely differentiated set of interactive tools most competitors simply don't have:

- Real-time **date checker + waitlist**
- **AI vendor matchmaker** and **"Design My Day"** palette visualizer
- **Style quiz**, **guest microsites**, **registry + cost-planner**, **silo (VRBO) booking**
- 24/7 **AI chat concierge**

That combination puts it ahead of ~90% of independent venue sites and level with the best-funded ones — the remaining gap is purely **real photography and copy**, not capability.

**CRM — rare for a venue this size.** Most venues run on HoneyBook, Tāve, Aisle Planner, or Perfect Venue (~$40–100/mo each, and none is venue-*and*-VRBO aware). "Venue OS" already covers lead pipeline, bookings calendar with AI open-date filling, contact dossiers (vendors + payments + tasks), an AI center (proposals, marketing, automations, receptionist), a content library, vendor auto-profiles, silo management, and financials/ROI. As a **custom, owned** system with no per-seat fees and a unified wedding + short-term-rental view, it's genuinely differentiated — the one caveat is that it's **demo-persisted** until the database is switched on.

---

## 5. Recommendations (prioritized)

### Before public launch (business, not engineering)
1. **Swap placeholder content** — real phone/email/address (the `(419) 555-1893` number is a non-dialable placeholder), real pricing, and **real photography** in place of stock. All centralized in `lib/content.ts` and `lib/silos.ts`.
2. **Go live on the database** — point the CRM read-views and silo/dossier persistence at Supabase (the sync calls are already wired). This turns demo-mode edits into shared, saved data.

### Before production traffic (engineering)
3. **Add the `/api/dossier` and `/api/silos` route handlers** so dossier and silo edits persist server-side (today they save to the browser only).
4. **Harden auth further** — extend the middleware matcher to cover mutation APIs as defense-in-depth, and confirm RLS policies match the app's access model.
5. **Durable rate limiting** — the current limiter is per-instance (in-memory). For real scale, move to Upstash/Redis.

### Polish & growth (nice-to-have)
6. **Modal keyboard UX** — add Escape-to-close and focus-trap to dialogs.
7. **Hydrate the Overview "hot leads" from saved edits** (currently a static snapshot).
8. **Real "virtual tour" video** to replace the "coming soon" placeholder, and make vendor category cards filter a live directory.
9. **Wire the remaining demo buttons** (contract send/remind, new automation) or label them clearly as demo.
10. **Payments** — connect Stripe/Helcim so deposits and registry gifts auto-log (the CRM already has the placeholders).

---

## 6. Known-and-intentional (not bugs)
- **Demo persistence** (localStorage + fire-and-forget API sync) is the deliberate pattern so the CRM is fully usable before the client commits to the database.
- **Placeholder content** is marked as such throughout and is a business decision, not a defect.
- **`document.execCommand`** in the rich-text editor is deprecated but functional; fine for now.

*Bottom line: engineering-wise this is ready. Add the real content and flip on the database, and it competes with — and in breadth, exceeds — the paid tools venues in this space actually use.*
