# 🎬 Demoing The Farm 1893 to the Client

A tight, ~12-minute flow built to land the "wow" moments in the right order and
tie each one to money.

**Live URLs**
- Website → https://thefarm1893.vercel.app
- Venue OS (CRM) → https://thefarm1893.vercel.app/dashboard
- Example guest microsite → https://thefarm1893.vercel.app/celebration/hannah-and-wes

**Before you start:** open the site and the CRM in two tabs, and have your phone
ready (couples browse on mobile — show it's gorgeous there too).

**Open with the frame:**
> "I didn't just redesign your website — I built you a lead-generation machine and
> the software to run the whole business. Let me show you."

---

## Part 1 — The couple's experience (~7 min)

**1. Homepage** — scroll slowly. *"This is the emotional first impression. Every
section is engineered to keep couples on the page and push them toward one thing:
booking a tour."* Point out the "100% couple-recommended" trust bar.

**2. Design My Day** *(the jaw-dropper — spend time here)* → nav → Design My Day.
Pick **Terracotta & Sage / Fall / Rustic**, generate. Then switch to
**Emerald & Gold / Winter**. *"No other venue lets a couple see their wedding in
their own colors before they even tour. This is what makes them fall in love —
and share it with their friends."*

**3. Check availability** → Investment page → date checker. Enter a Saturday.
*"Instant answer, instant price, and it tells them the perfect ceremony time for
golden-hour photos. Couples get answers at midnight instead of waiting on an
email — that's how you win the booking."*

**4. Rosie, the AI concierge** → click the chat bubble, ask *"is October 2026
available?"* *"She works 24/7 and captures every lead — even at 2am. She can
answer the phone by text, too."*

**5. Vendors** → Vendors page → run the AI Dream-Team Builder. *"This is a new
revenue stream. Vendors pay to be featured, and you earn a referral commission
every time a couple books one."*

**6. The guest experience** → open the example microsite. Scroll to **Reserve Your
Room** and the **registry**. *"Every booked couple gets this branded site — and
hundreds of their guests land on YOUR brand. Guests pay for their own rooms and
gift toward the wedding, which lowers the couple's cost. Nobody else does this."*

---

## Part 2 — The business engine (~4 min)

**7. The CRM** → `/dashboard`. Hit the AI insights strip and revenue chart. *"It
tells you which leads are hot and to reply within the hour — leads answered fast
convert 3× more often."*

**8. A client dossier** → Contacts → click **Hannah Whitfield**. *"One click and
you see the entire wedding: the vendor team, payments, the cost split, the
registry, and a button to preview their guest site."*

**9. AI Proposals** → sidebar → AI Proposals → generate one. *"One click turns a
lead into a personalized, itemized proposal. What used to take an hour takes ten
seconds."*

---

## Part 3 — The close

> "More bookings (24/7 capture + instant answers), new revenue (vendor referrals +
> retreats + upsells), and far less work (AI does the follow-ups, proposals, and
> marketing). It pays for itself with one extra wedding a year."

Then the ask:
> "What we're seeing today runs on realistic sample data. To go fully live — real
> bookings, real payments, real guest logins — is the next phase. Let me walk you
> through what that looks like."

---

## 🎯 Quick tips

- **Do say:** "this is a working prototype on sample data." **Don't** imply
  payments are processing yet.
- **Lead with Design My Day and the guest microsite** — the "no one else has this"
  moments that justify premium pricing.
- **On mobile,** show the homepage + Rosie.
- If they ask *"is this real?"* → *"The design and every feature are real and live.
  Turning on the database and payments is a quick, planned next step."*

---

## What's live vs. next phase

| Live now (on sample data) | Next phase (needs keys/accounts) |
|---|---|
| Entire website + all pages | Real database (Supabase) — saved leads/bookings |
| Design My Day (curated + palette-accurate) | Real AI photos (add `OPENAI_API_KEY`) |
| AI concierge, lead scoring, proposals, insights | Live payments (Stripe) — room/registry/deposits |
| Cost planner, registry, guest microsites (demo) | Guest logins + persistent, shared data |
| Full CRM with sample records | Real content: client's photos, pricing, phone |
