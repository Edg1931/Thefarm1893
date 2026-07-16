/* ============================================================================
   GROWTH & OPERATIONS DATA — automations, contracts, referrals, analytics.
   Powers the Venue OS growth suite. Sample data for the demo; every action is
   pluggable (email/SMS via Resend/Twilio, e-sign + deposits via Stripe).
   ============================================================================ */

/* --- AI drip automations --- */
export type Sequence = {
  id: string;
  name: string;
  trigger: string;
  status: "active" | "paused";
  enrolled: number;
  booked: number;
  steps: { channel: "Email" | "SMS"; delay: string; subject: string }[];
};

export const sequences: Sequence[] = [
  {
    id: "S1", name: "New Lead Welcome", trigger: "Form or Rosie chat submitted", status: "active",
    enrolled: 312, booked: 41,
    steps: [
      { channel: "Email", delay: "Instantly", subject: "You're going to love it here 🌾 (brochure inside)" },
      { channel: "SMS", delay: "15 minutes", subject: "Hi {{first}}! Want to grab a tour this week?" },
      { channel: "Email", delay: "2 days", subject: "3 reasons couples pick The Farm 1893" },
      { channel: "Email", delay: "5 days", subject: "A few dates are still open for your season" },
    ],
  },
  {
    id: "S2", name: "Toured, Not Booked", trigger: "Tour completed, no contract in 3 days", status: "active",
    enrolled: 58, booked: 19,
    steps: [
      { channel: "Email", delay: "1 day after tour", subject: "It was so lovely meeting you!" },
      { channel: "SMS", delay: "3 days", subject: "Still dreaming about that orchard? Your date is still open." },
      { channel: "Email", delay: "7 days", subject: "Hold your date — here's how it works" },
    ],
  },
  {
    id: "S3", name: "Anniversary Re-Engagement", trigger: "1 year after wedding date", status: "active",
    enrolled: 46, booked: 6,
    steps: [
      { channel: "Email", delay: "On anniversary", subject: "Happy anniversary! 💛 Come celebrate where it began" },
      { channel: "Email", delay: "+2 weeks", subject: "Host your vow renewal or anniversary party with us" },
    ],
  },
  {
    id: "S5", name: "Silo Stays — Come Back", trigger: "VRBO guest, 11 months after checkout", status: "active",
    enrolled: 137, booked: 34,
    steps: [
      { channel: "Email", delay: "3 days after checkout", subject: "Thank you for staying! How was your silo? ⭐ (quick review)" },
      { channel: "Email", delay: "11 months later", subject: "It's almost that time again — your silo is waiting 🌾" },
      { channel: "SMS", delay: "+1 week", subject: "Book direct and save 10% on your return stay, {{first}}" },
      { channel: "Email", delay: "Seasonal", subject: "Fall at the farm is unreal — grab a weekend before they're gone" },
    ],
  },
  {
    id: "S4", name: "Slow-Week Filler", trigger: "Open date within 60 days", status: "paused",
    enrolled: 0, booked: 0,
    steps: [
      { channel: "Email", delay: "When triggered", subject: "A rare last-minute opening at the farm" },
    ],
  },
];

/* --- Contracts & deposits --- */
export type Contract = {
  id: string;
  client: string;
  event: string;
  date: string;
  value: number;
  status: "draft" | "sent" | "signed" | "paid";
  deposit: number;
  depositPaid: boolean;
};

export const contracts: Contract[] = [
  { id: "C-2041", client: "Hannah Whitfield", event: "Wedding", date: "2026-09-19", value: 11250, status: "signed", deposit: 2800, depositPaid: true },
  { id: "C-2040", client: "The Bauer Company", event: "Corporate Retreat", date: "2026-08-22", value: 12000, status: "paid", deposit: 3000, depositPaid: true },
  { id: "C-2039", client: "Marcus & Dee Coleman", event: "Wedding", date: "2026-10-10", value: 14000, status: "sent", deposit: 3500, depositPaid: false },
  { id: "C-2038", client: "Sofia Alvarez", event: "50th Anniversary", date: "2026-07-26", value: 6500, status: "draft", deposit: 1600, depositPaid: false },
];

/* --- Referral / ambassador program --- */
export type Referral = {
  advocate: string;
  referred: string;
  status: "invited" | "toured" | "booked";
  reward: string;
  date: string;
};

export const referrals: Referral[] = [
  { advocate: "Hannah Whitfield", referred: "Jenna & Cole", status: "booked", reward: "Free anniversary night", date: "2026-06-14" },
  { advocate: "Priya Raman", referred: "The Okafor family", status: "toured", reward: "Pending", date: "2026-06-28" },
  { advocate: "The Bauer Company", referred: "Lakeside Realty", status: "invited", reward: "Pending", date: "2026-07-02" },
  { advocate: "Emily Sørensen", referred: "Maya & Tom", status: "booked", reward: "$250 credit", date: "2026-05-30" },
];

export const referralStats = {
  activeAdvocates: 24,
  referredLeads: 63,
  bookedFromReferrals: 11,
  revenueFromReferrals: 178500,
};

/* --- Analytics AI insights (the "loop") --- */
export const analyticsInsights = [
  { tone: "terracotta", icon: "alert", title: "Instagram traffic isn't converting", body: "Instagram drives 27% of visitors but only 9% of tours. Your reels get views, not clicks — add a 'check your date' link in bio and story CTAs. Projected: +6 tours/mo." },
  { tone: "sage", icon: "trend", title: "Organic search is your best lead source", body: "SEO visitors convert at 2.3× the site average. The new Journal is already ranking for 'Ohio barn wedding venue' — publish 2 more posts this month to compound it." },
  { tone: "brass", icon: "sparkle", title: "Tuesday emails outperform", body: "Your Tuesday 10am sends see 41% opens vs 28% average. The AI scheduler will now default new campaigns to that window." },
  { tone: "ink", icon: "star", title: "Design My Day is a conversion engine", body: "Couples who use the visualizer book at 3.1× the rate of those who don't. Feature it more prominently — it's your strongest differentiator." },
];
