/* ============================================================================
   COMMUNICATIONS & GROWTH DATA
   Unified inbox threads (email / SMS / web chat / Airbnb / VRBO), review
   aggregation + requests, promo coupons, and automation rules. Sample data
   keeps these alive in a walkthrough; live rows come from Supabase.
   ============================================================================ */

export type Channel = "email" | "sms" | "web_chat" | "airbnb" | "vrbo" | "facebook";

export type Conversation = {
  id: string;
  name: string;
  channel: Channel;
  preview: string;
  lastAt: string;
  unread: boolean;
  messages: { role: "inbound" | "outbound" | "ai"; body: string; at: string }[];
};

export type Review = {
  id: string;
  source: "google" | "airbnb" | "vrbo" | "facebook" | "the-knot";
  author: string;
  rating: number;
  body: string;
  date: string;
};

export type Coupon = {
  id: string;
  code: string;
  kind: "percent" | "amount";
  amount: number;
  expiresAt: string;
  uses: number;
  maxUses: number;
  active: boolean;
};

export type Automation = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  runs: number;
};

/* ---- sample data ---------------------------------------------------------- */

export const sampleConversations: Conversation[] = [
  {
    id: "cv1", name: "Hannah Whitfield", channel: "email", preview: "Can we add the bonfire package?", lastAt: "2026-07-29T16:40:00Z", unread: true,
    messages: [
      { role: "inbound", body: "Hi! We're so excited. Can we add the bonfire package to our weekend?", at: "2026-07-29T16:40:00Z" },
    ],
  },
  {
    id: "cv2", name: "Airbnb Guest · Copper Silo", channel: "airbnb", preview: "What time is check-in?", lastAt: "2026-07-29T14:05:00Z", unread: true,
    messages: [
      { role: "inbound", body: "Hi there — what time can we check in on Friday?", at: "2026-07-29T14:05:00Z" },
      { role: "ai", body: "Check-in is any time after 4 PM! I'll text your door code and guidebook that morning. 🌾", at: "2026-07-29T14:06:00Z" },
    ],
  },
  {
    id: "cv3", name: "Marcus Coleman", channel: "sms", preview: "Sounds good, see you Saturday!", lastAt: "2026-07-28T19:12:00Z", unread: false,
    messages: [{ role: "inbound", body: "Sounds good, see you Saturday!", at: "2026-07-28T19:12:00Z" }],
  },
  {
    id: "cv4", name: "VRBO Guest · Meadow Silo", channel: "vrbo", preview: "Is the hot tub available in October?", lastAt: "2026-07-27T11:30:00Z", unread: false,
    messages: [{ role: "inbound", body: "Is the hot tub available in October?", at: "2026-07-27T11:30:00Z" }],
  },
];

export const sampleReviews: Review[] = [
  { id: "rv1", source: "google", author: "Jenna R.", rating: 5, body: "The most magical weekend of our lives. The whole family stayed on-site — we never wanted to leave.", date: "2026-07-10" },
  { id: "rv2", source: "the-knot", author: "Cole & Amir", rating: 5, body: "Booking the Farm was the best decision we made. Rosie answered every question instantly.", date: "2026-06-28" },
  { id: "rv3", source: "airbnb", author: "Dana K.", rating: 5, body: "The Copper Silo is a dream. Spotless, cozy, and the sunrise over the orchard is unreal.", date: "2026-06-15" },
  { id: "rv4", source: "vrbo", author: "The Okafors", rating: 4, body: "Beautiful stay. Wifi was a touch slow but the hosts fixed it same day.", date: "2026-05-30" },
  { id: "rv5", source: "facebook", author: "Maya T.", rating: 5, body: "We hosted my mom's 50th here and it was flawless. Highly recommend the gathering package.", date: "2026-05-18" },
];

export const sampleCoupons: Coupon[] = [
  { id: "cp1", code: "WEEKDAY10", kind: "percent", amount: 10, expiresAt: "2026-12-31", uses: 6, maxUses: 100, active: true },
  { id: "cp2", code: "BOOKDIRECT", kind: "percent", amount: 10, expiresAt: "2026-12-31", uses: 41, maxUses: 0, active: true },
  { id: "cp3", code: "OFFSEASON250", kind: "amount", amount: 250, expiresAt: "2026-11-30", uses: 3, maxUses: 25, active: true },
];

export const sampleAutomations: Automation[] = [
  { id: "au1", name: "New-lead welcome", trigger: "lead.created", action: "email:welcome", active: true, runs: 312 },
  { id: "au2", name: "Toured, not booked (3d)", trigger: "tour.completed+3d", action: "email:nudge", active: true, runs: 58 },
  { id: "au3", name: "Post-stay review request", trigger: "stay.checkout+3d", action: "email:review-request", active: true, runs: 137 },
  { id: "au4", name: "Balance reminder (14d before)", trigger: "invoice.due-14d", action: "email:reminder", active: true, runs: 22 },
  { id: "au5", name: "Guest → future couple", trigger: "rsvp.future-couple", action: "sequence:guest-nurture", active: false, runs: 9 },
];

export function ratingSummary(reviews: Review[]) {
  if (reviews.length === 0) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { avg: Math.round(avg * 10) / 10, count: reviews.length };
}

export function couponValid(c: Coupon): boolean {
  const notExpired = new Date(c.expiresAt + "T23:59:59").getTime() >= Date.now();
  const underCap = c.maxUses === 0 || c.uses < c.maxUses;
  return c.active && notExpired && underCap;
}
