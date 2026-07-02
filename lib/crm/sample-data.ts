/* ============================================================================
   SAMPLE CRM DATA — realistic demo records so the dashboard is alive on day one.
   Replace with live Supabase queries once the DB is connected.
   ============================================================================ */

export type Stage = "new" | "toured" | "proposal" | "booked" | "lost";

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  budget: number;
  stage: Stage;
  score: number;
  priority: "hot" | "warm" | "nurture";
  source: string;
  lastActivity: string;
  aiSummary: string;
};

export const leads: Lead[] = [
  {
    id: "L-1042", name: "Hannah Whitfield", email: "hannah.w@email.com", phone: "(419) 555-0142",
    eventType: "Wedding", eventDate: "2026-09-19", guestCount: 165, budget: 24000,
    stage: "proposal", score: 94, priority: "hot", source: "The Knot",
    lastActivity: "2h ago",
    aiSummary: "🔥 Toured last week, loved the orchard. Proposal sent — follow up within 1 hour; she mentioned deciding this weekend.",
  },
  {
    id: "L-1041", name: "Marcus & Dee Coleman", email: "dcoleman@email.com", phone: "(216) 555-0199",
    eventType: "Wedding", eventDate: "2026-10-10", guestCount: 200, budget: 31000,
    stage: "toured", score: 88, priority: "hot", source: "Instagram",
    lastActivity: "1d ago",
    aiSummary: "Peak-season Saturday, largest guest count this month. Send the Weekend package + farmhouse photos.",
  },
  {
    id: "L-1040", name: "Priya Raman", email: "priya.r@email.com", phone: "(440) 555-0177",
    eventType: "Wedding", eventDate: "2027-06-12", guestCount: 120, budget: 19500,
    stage: "new", score: 72, priority: "warm", source: "Website",
    lastActivity: "3h ago",
    aiSummary: "Early planner, high-intent language ('ready to book a tour'). Auto-welcome sent; offer weekday tour.",
  },
  {
    id: "L-1039", name: "The Bauer Company", email: "events@bauerco.com", phone: "(419) 555-0165",
    eventType: "Corporate Retreat", eventDate: "2026-08-22", guestCount: 60, budget: 12000,
    stage: "booked", score: 90, priority: "hot", source: "Referral",
    lastActivity: "5d ago",
    aiSummary: "✅ Booked & deposit paid. Upsell opportunity: catering + bonfire add-on.",
  },
  {
    id: "L-1038", name: "Sofia Alvarez", email: "sofia.a@email.com", phone: "(567) 555-0121",
    eventType: "50th Anniversary", eventDate: "2026-07-26", guestCount: 45, budget: 6500,
    stage: "proposal", score: 65, priority: "warm", source: "Facebook",
    lastActivity: "2d ago",
    aiSummary: "Gathering package fit. Price-sensitive — highlight the single-day value + Sunday availability.",
  },
  {
    id: "L-1037", name: "Jordan Blake", email: "jblake@email.com", phone: "(419) 555-0110",
    eventType: "Wedding", eventDate: "2026-05-30", guestCount: 90, budget: 15000,
    stage: "new", score: 58, priority: "warm", source: "Google",
    lastActivity: "6h ago",
    aiSummary: "Near-term date still open — rare! Flag as urgency opportunity in follow-up.",
  },
  {
    id: "L-1036", name: "Emily Sørensen", email: "emily.s@email.com", phone: "(216) 555-0188",
    eventType: "Bridal Shower", eventDate: "2026-04-18", guestCount: 30, budget: 3200,
    stage: "lost", score: 40, priority: "nurture", source: "Website",
    lastActivity: "3w ago",
    aiSummary: "Chose a smaller venue on price. Add to 'future weddings' nurture list — she's engaged for 2027.",
  },
  {
    id: "L-1035", name: "Nathan & Kai Rivera", email: "nrivera@email.com", phone: "(440) 555-0133",
    eventType: "Wedding", eventDate: "2027-09-25", guestCount: 140, budget: 22000,
    stage: "toured", score: 81, priority: "hot", source: "The Knot",
    lastActivity: "4d ago",
    aiSummary: "Loved the barn at night. Deciding between us and one competitor — send the testimonial reel.",
  },
];

export type BookingEvent = {
  date: string;
  title: string;
  type: string;
  status: "confirmed" | "tentative" | "tour";
};

export const upcomingEvents: BookingEvent[] = [
  { date: "2026-07-12", title: "Whitfield Wedding", type: "Wedding", status: "confirmed" },
  { date: "2026-07-18", title: "Bauer Co. Retreat", type: "Corporate", status: "confirmed" },
  { date: "2026-07-26", title: "Alvarez 50th", type: "Anniversary", status: "tentative" },
  { date: "2026-07-08", title: "Raman Tour", type: "Tour", status: "tour" },
  { date: "2026-07-15", title: "Coleman Tour", type: "Tour", status: "tour" },
];

/** Dates already spoken for (used by the public availability checker demo). */
export const bookedDates = [
  "2026-07-12", "2026-07-18", "2026-08-22", "2026-09-19",
  "2026-09-26", "2026-10-03", "2026-10-10", "2026-10-17",
];

export const dashboardStats = {
  pipelineValue: 129700,
  bookedRevenueYTD: 342500,
  leadsThisMonth: 34,
  conversionRate: 31,
  toursScheduled: 7,
  avgResponseMins: 4,
};

export const revenueByMonth = [
  { month: "Jan", value: 18 }, { month: "Feb", value: 12 }, { month: "Mar", value: 24 },
  { month: "Apr", value: 41 }, { month: "May", value: 68 }, { month: "Jun", value: 82 },
  { month: "Jul", value: 74 }, { month: "Aug", value: 63 }, { month: "Sep", value: 88 },
  { month: "Oct", value: 79 }, { month: "Nov", value: 34 }, { month: "Dec", value: 46 },
];

export const aiInsights = [
  {
    icon: "trend",
    tone: "sage",
    title: "Revenue pacing +18% vs. last year",
    body: "You're on track for a record October. 3 peak Saturdays remain open — prioritize the Coleman and Rivera proposals to close the quarter strong.",
  },
  {
    icon: "alert",
    tone: "terracotta",
    title: "2 hot leads need a reply",
    body: "Hannah Whitfield and Jordan Blake haven't heard back in over an hour. Leads contacted within 5 minutes convert 3× more often. Draft replies ready.",
  },
  {
    icon: "sparkle",
    tone: "brass",
    title: "Fill your slow week (Apr 13–19)",
    body: "AI suggests a 'Micro-Wedding Monday' promo. Projected to fill 2 of 4 open dates. Tap to generate the Instagram campaign + email blast.",
  },
  {
    icon: "star",
    tone: "ink",
    title: "5 new 5-star reviews to reshare",
    body: "Turn last month's reviews into social proof. Auto-generate 5 branded quote graphics for Instagram + your homepage testimonial wall.",
  },
];
