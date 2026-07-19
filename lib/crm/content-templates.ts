/* ============================================================================
   CONTENT LIBRARY — ready-to-use marketing collateral for the venue.
   Text templates carry real, on-brand copy (copy/paste or send as-is).
   Visual templates render a branded, printable preview. Everything can be
   handed to the AI Marketing Studio to customize per couple / campaign.
   ============================================================================ */

import { business } from "@/lib/content";

export type ContentCategory = "Print" | "Social" | "Email" | "Signage";
export type ContentFormat = "copy" | "visual";

export type ContentTemplate = {
  id: string;
  category: ContentCategory;
  format: ContentFormat;
  title: string;
  description: string;
  meta?: string;        // e.g. "Tri-fold · 8.5×11", "1080×1080"
  body?: string;        // real copy for `copy` templates
  visual?: {            // branded preview for `visual` templates
    kicker: string;
    headline: string;
    sub: string;
    bullets?: string[];
    footer: string;
    theme: "orchard" | "ink" | "brass";
    shape?: "portrait" | "square" | "wide";
  };
};

const b = business;

export const contentTemplates: ContentTemplate[] = [
  /* -------------------------------- PRINT -------------------------------- */
  {
    id: "flyer-open-house",
    category: "Print", format: "visual",
    title: "Open House Flyer",
    description: "A one-page flyer to promote a tour day or open house. Print or post digitally.",
    meta: "8.5×11 · portrait",
    visual: {
      kicker: "You're invited",
      headline: "Open House & Tour Day",
      sub: `Walk the orchard, see the barn dressed for a wedding, and meet the team behind ${b.name}.`,
      bullets: ["Guided venue tours", "Sample menu tastings", "Meet our preferred vendors", "Exclusive booking offer for attendees"],
      footer: `${b.address} · ${b.phone}`,
      theme: "orchard", shape: "portrait",
    },
  },
  {
    id: "brochure-trifold",
    category: "Print", format: "visual",
    title: "Venue Tri-Fold Brochure",
    description: "The leave-behind brochure: your story, packages, and the all-in-one weekend.",
    meta: "Tri-fold · 8.5×11",
    visual: {
      kicker: `Est. ${b.established}`,
      headline: "A Weekend to Remember",
      sub: `${b.tagline} in ${b.city}, ${b.region}. Ceremony, celebration, and a place to stay — all in one unforgettable place.`,
      bullets: ["44-hour exclusive weekend", "Sleeps 25 on-site", "Farmhouse + four restored silos", "In-house planning & preferred vendors"],
      footer: `thefarm1893.com · ${b.email}`,
      theme: "ink", shape: "portrait",
    },
  },
  {
    id: "pricing-sheet",
    category: "Print", format: "visual",
    title: "Package & Pricing Sheet",
    description: "A clean one-pager with your three packages side by side.",
    meta: "8.5×11 · portrait",
    visual: {
      kicker: "Investment",
      headline: "Wedding Packages",
      sub: "Three ways to celebrate — every package includes the grounds, tables & chairs, and a day-of coordinator.",
      bullets: ["The Gathering — intimate, up to 75 guests", "The Weekend — our signature 44-hour experience", "The Grand — full-property, 200 guests + silos"],
      footer: `Custom quotes: ${b.phone}`,
      theme: "brass", shape: "portrait",
    },
  },
  {
    id: "rack-card",
    category: "Print", format: "visual",
    title: "Rack Card",
    description: "Pocket-size card for bridal shows and vendor counters.",
    meta: "4×9 · portrait",
    visual: {
      kicker: b.tagline,
      headline: b.name,
      sub: "Ohio's all-in-one orchard wedding venue.",
      bullets: ["Scan to tour", "Weekends still open for 2026"],
      footer: `${b.phone} · ${b.city}, ${b.region}`,
      theme: "orchard", shape: "portrait",
    },
  },

  /* -------------------------------- SOCIAL ------------------------------- */
  {
    id: "ig-date-drop",
    category: "Social", format: "visual",
    title: "Instagram — Open Date Drop",
    description: "Square graphic to announce a newly open weekend and drive urgency.",
    meta: "1080×1080",
    visual: {
      kicker: "Just opened",
      headline: "One Saturday Left",
      sub: "A peak-season date just opened up. When it's gone, it's gone.",
      footer: "DM us “DATE” to grab it →",
      theme: "brass", shape: "square",
    },
  },
  {
    id: "ig-caption-tour",
    category: "Social", format: "copy",
    title: "Instagram Caption — Book a Tour",
    description: "Ready-to-post caption with hashtags to drive tour bookings.",
    meta: "Caption + hashtags",
    body:
`Your wedding weekend could start right here 🍎✨

Picture it: a golden-hour ceremony in the orchard, dinner under the stars, and a farmhouse full of your favorite people — all on one historic property.

We're booking 2026 & 2027 tours now. Comment “TOUR” or tap the link in our bio to find your date. 🤍

#${b.city.replace(/\s/g, "")}Wedding #OhioWeddingVenue #OrchardWedding #BarnWedding #TheFarm1893 #EngagedInOhio #2026Bride #WeekendWedding`,
  },
  {
    id: "fb-event",
    category: "Social", format: "copy",
    title: "Facebook Event — Open House",
    description: "Event description copy for a Facebook/Meta open-house listing.",
    meta: "Event body",
    body:
`✨ ${b.name} Open House ✨

Thinking about an Ohio wedding? Come see the magic in person. Join us for a relaxed afternoon of guided tours, menu tastings, and vendor introductions — no pressure, all inspiration.

📍 ${b.address}
🍎 Guided tours every 30 minutes
🍽️ Complimentary tastings
💍 Special booking offer for attendees only

Bring your partner, your mom, your maid of honor — whoever helps you dream. RSVP so we can save you a spot!

Questions? Call ${b.phone} or message us here.`,
  },
  {
    id: "ig-story-quote",
    category: "Social", format: "visual",
    title: "Instagram Story — Review Highlight",
    description: "Vertical story graphic to reshare a 5-star couple review.",
    meta: "1080×1920",
    visual: {
      kicker: "★★★★★",
      headline: "“The best day of our lives.”",
      sub: "— Hannah & Wes, married at the orchard",
      footer: "Tap to read more real weddings →",
      theme: "ink", shape: "portrait",
    },
  },

  /* -------------------------------- EMAIL -------------------------------- */
  {
    id: "email-inquiry",
    category: "Email", format: "copy",
    title: "Email — Inquiry Auto-Reply",
    description: "The instant first reply every new lead should get within minutes.",
    meta: "Subject + body",
    body:
`Subject: Thank you for reaching out to ${b.name}! 🍎

Hi {{first_name}},

Thank you so much for your interest in ${b.name} — we'd be honored to be part of your celebration!

I'd love to learn more about your day. A few quick questions:
• Do you have a date (or season) in mind?
• About how many guests are you expecting?
• Would you like a private tour this week?

In the meantime, here's our digital brochure with packages and photos: {{brochure_link}}

I'll follow up personally within the day — but feel free to call or text us anytime at ${b.phone}.

Warmly,
The Team at ${b.name}
${b.email} · thefarm1893.com`,
  },
  {
    id: "email-tour-confirm",
    category: "Email", format: "copy",
    title: "Email — Tour Confirmation",
    description: "Confirms a scheduled tour with directions and what to expect.",
    meta: "Subject + body",
    body:
`Subject: Your tour of ${b.name} is confirmed! 🌾

Hi {{first_name}},

You're all set! We can't wait to show you around.

📅 {{tour_date}} at {{tour_time}}
📍 ${b.address}

Plan on about 45 minutes. Wear comfy shoes (we'll walk the orchard!) and bring anyone who's helping you plan. We'll have cold drinks waiting.

Need to reschedule? Just reply here or call ${b.phone}.

See you soon,
The Team at ${b.name}`,
  },
  {
    id: "email-followup",
    category: "Email", format: "copy",
    title: "Email — Post-Tour Follow-Up",
    description: "Sent the evening after a tour to keep momentum and offer a hold.",
    meta: "Subject + body",
    body:
`Subject: It was so lovely meeting you today 🤍

Hi {{first_name}},

It was wonderful having you at the farm today — thank you for spending time with us! I can already picture your {{season}} wedding in the orchard.

Your date, {{event_date}}, is still available, and I'd be glad to place a courtesy hold on it for 5 days — no commitment — so no one else can book it while you decide.

Want me to hold it? Just reply “yes” and it's done.

Whenever you're ready, I'm here for any questions.

Warmly,
{{coordinator_name}}
${b.name} · ${b.phone}`,
  },

  /* ------------------------------- SIGNAGE ------------------------------- */
  {
    id: "sign-welcome",
    category: "Signage", format: "visual",
    title: "Welcome Sign",
    description: "A printable welcome sign to greet guests at the entrance.",
    meta: "18×24 · portrait",
    visual: {
      kicker: "Welcome to",
      headline: "{{couple_names}}",
      sub: "We're so glad you're here to celebrate with us.",
      footer: `${b.name} · ${b.city}, ${b.region}`,
      theme: "orchard", shape: "portrait",
    },
  },
  {
    id: "sign-directional",
    category: "Signage", format: "visual",
    title: "Ceremony / Reception Directional",
    description: "Point guests from parking to the ceremony and reception.",
    meta: "12×18 · portrait",
    visual: {
      kicker: "This way",
      headline: "Ceremony →",
      sub: "Reception to follow in the barn",
      footer: "Restrooms & bar inside",
      theme: "brass", shape: "portrait",
    },
  },
];

export const contentCategories: ContentCategory[] = ["Print", "Social", "Email", "Signage"];
