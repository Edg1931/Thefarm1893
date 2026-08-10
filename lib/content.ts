/* ============================================================================
   SITE CONTENT — single source of truth for all public marketing copy.
   Everything here is a POLISHED PLACEHOLDER. Swap in the client's real
   pricing, photos, phone, and copy in this one file.
   (Real facts already gathered from thefarm1893.com are marked ✓REAL.)
   ============================================================================ */

export const business = {
  name: "The Farm 1893",
  tagline: "Wedding & Gathering Venue",
  // ✓REAL — Berlin Heights, OH
  city: "Berlin Heights",
  region: "Ohio",
  address: "12316 Berlin Road, Berlin Heights, OH 44814",
  // ✓REAL — interim line until the venue's own number/domain is set up
  phone: "(567) 623-5455",
  phoneHref: "tel:+15676235455",
  email: "thefarm1893@gmail.com",
  established: 1893,
  instagram: "https://instagram.com/thefarm1893",
  facebook: "https://facebook.com/thefarm1893",
  heroHeadline: "Where your love story finds its home",
  heroSub:
    "A historic 1893 orchard, reimagined as an intimate all-in-one wedding & gathering venue in the Ohio countryside — ceremony, celebration, and a weekend to stay, all in one unforgettable place.",
};

/* ---------------------------------------------------------------------------
   CONTENT STATUS — which pieces are still placeholder.
   Flip an entry to "real" once you've swapped in the client's genuine content.
   While an item is "placeholder", the app protects guests from it: the fake
   phone renders as plain text instead of a tap-to-call link that dials nowhere,
   and invented review counts stay out of the structured data we publish.
   The dashboard (Integrations → Content to replace) lists everything still flagged.
   --------------------------------------------------------------------------- */
export type ContentKey = "phone" | "pricing" | "testimonials" | "photos";
export type ContentState = "placeholder" | "real";

export const contentStatus: Record<ContentKey, ContentState> = {
  phone: "real",              // (567) 623-5455 — interim line, tap-to-call enabled
  pricing: "placeholder",     // packages below are illustrative
  testimonials: "placeholder",// sample quotes, not real couples
  photos: "real",             // client's photos are loaded in the Photos bucket
};

export type NavLink = { label: string; href: string };
export const nav: NavLink[] = [
  { label: "The Venue", href: "/venue" },
  { label: "Weddings", href: "/weddings" },
  { label: "Gatherings", href: "/gatherings" },
  // "The Stay" (/accommodations) and "Retreats" (/stay) both described the same
  // farmhouse and now live inside Silo Stays, which covers all lodging.
  { label: "Silo Stays", href: "/silos" },
  { label: "Design My Day", href: "/design-my-day" },
  { label: "Style Quiz", href: "/quiz" },
  { label: "Gallery", href: "/gallery" },
  { label: "Real Weddings", href: "/real-weddings" },
  { label: "Vendors", href: "/vendors" },
  { label: "Journal", href: "/journal" },
  { label: "Refer a Friend", href: "/refer" },
  { label: "Pricing", href: "/pricing" },
  { label: "Our Story", href: "/about" },
];

/** Curated subset for the top header (the footer shows the full nav). */
export const navPrimary: NavLink[] = [
  { label: "The Venue", href: "/venue" },
  { label: "Weddings", href: "/weddings" },
  { label: "Gallery", href: "/gallery" },
  { label: "Design My Day", href: "/design-my-day" },
  { label: "Vendors", href: "/vendors" },
  { label: "Pricing", href: "/pricing" },
];

/* --- Trust / at-a-glance stats --- */
export const stats = [
  { value: "100%", label: "Couple recommended" }, // ✓REAL (The Knot / WeddingWire)
  { value: "25", label: "Overnight guests on-site" }, // ✓REAL
  { value: "44hrs", label: "Fri 3PM – Sun 11AM exclusive" }, // ✓REAL
  { value: "1893", label: "Historic orchard, reborn" }, // ✓REAL
];

/* --- The spaces --- */
export type Space = {
  slug: string;
  name: string;
  blurb: string;
  detail: string;
  capacity: string;
  image: string;
  tag: string;
};
export const spaces: Space[] = [
  {
    slug: "the-barn",
    name: "The Barn",
    tag: "Reception",
    blurb: "Soaring timber, warm light, and room to dance until the last song.",
    detail:
      "Our restored post-and-beam barn pairs rustic bones with modern comfort — climate-controlled, string-lit, and effortlessly elegant for seated dinners of up to 200.",
    capacity: "Up to 200 seated",
    image:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "the-orchard-lawn",
    name: "The Orchard Lawn",
    tag: "Ceremony",
    blurb: "Say 'I do' beneath heritage fruit trees at golden hour.",
    detail:
      "A living ceremony backdrop generations in the making. Rows of apple trees, open sky, and a gentle Ohio breeze — with a covered porch alternative should the weather turn.",
    capacity: "Up to 220 guests",
    image:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "the-covered-porch",
    name: "The Covered Porch",
    tag: "Ceremony & Cocktails",
    blurb: "Weather-worry-free vows and a cocktail hour with a view.",
    detail:
      "Rain or shine, the wraparound covered porch keeps the celebration going — a natural flow from ceremony to cocktails to the barn doors opening.",
    capacity: "Up to 120 guests",
    image:
      "https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1400&q=80",
  },
  {
    slug: "the-farmhouse",
    name: "The Farmhouse",
    tag: "The Stay",
    blurb: "Get ready — and stay the weekend — with your closest people.",
    detail:
      "Sleeps up to 25 across beautifully appointed suites. Bridal prep in the morning light, a bonfire at night, and no rush home. The whole weekend is yours.",
    capacity: "Sleeps 25 overnight",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
  },
];

/* --- Packages / investment (placeholder pricing) --- */
export type Package = {
  name: string;
  price: string;
  cadence: string;
  summary: string;
  featured?: boolean;
  features: string[];
};
export const packages: Package[] = [
  {
    name: "The Gathering",
    price: "$4,500",
    cadence: "single-day event",
    summary: "Micro-weddings, showers, and celebrations of life up to 75 guests.",
    features: [
      "8-hour venue access",
      "Orchard lawn OR covered porch ceremony",
      "The Barn for dinner & dancing",
      "Tables, chairs & farm-style seating",
      "On-site parking & day-of attendant",
      "Getting-ready suite",
    ],
  },
  {
    name: "The Weekend",
    price: "$9,800",
    cadence: "Fri 3PM – Sun 11AM",
    summary:
      "Our signature all-inclusive weekend — the whole farm, exclusively yours.",
    featured: true,
    features: [
      "Exclusive 44-hour property access ✓",
      "Rehearsal dinner space included",
      "Farmhouse stay for up to 25 guests ✓",
      "Ceremony, cocktail hour & reception",
      "Bridal suite + groom's quarters",
      "Bonfire pit, lawn games & orchard photos",
      "Dedicated venue coordinator",
      "Sunday brunch send-off setup",
    ],
  },
  {
    name: "The Legacy",
    price: "Custom",
    cadence: "multi-day & luxury",
    summary: "Extended stays, full-service planning, and elevated add-ons.",
    features: [
      "Everything in The Weekend",
      "3-day / multi-event timelines",
      "Curated preferred-vendor team",
      "Full-service design & coordination",
      "Welcome-party & farewell-brunch programming",
      "Concierge guest lodging coordination",
    ],
  },
];

/* --- Amenities grid --- */
export const amenities = [
  "Climate-controlled restored barn",
  "Rain-or-shine covered porch",
  "On-site farmhouse (sleeps 25)",
  "Bridal suite & groom's quarters",
  "Heritage orchard photo backdrops",
  "Ample on-site parking",
  "Bonfire pit & lawn games",
  "Catering prep kitchen",
  "Wheelchair accessible",
  "Pet-friendly ceremonies",
  "Ceremony + reception in one place",
  "Dedicated day-of coordinator",
];

/* --- Testimonials (placeholder) --- */
export type Testimonial = {
  quote: string;
  name: string;
  detail: string;
};
export const testimonials: Testimonial[] = [
  {
    quote:
      "We looked at eleven venues. The moment we drove up the orchard lane, we cancelled every other tour. Having everyone stay the whole weekend made it feel less like a wedding and more like a family reunion we never wanted to end.",
    name: "Hannah & Wes",
    detail: "Married September 2025",
  },
  {
    quote:
      "The barn at night is pure magic — string lights, the smell of the bonfire, our people dancing. The coordinator thought of everything before we did. Genuinely the best day of our lives.",
    name: "Priya & Sam",
    detail: "Married June 2025",
  },
  {
    quote:
      "As the mother of the bride, I finally got to enjoy the day instead of running it. Not needing to rush anyone home Sunday morning was the gift I didn't know to ask for.",
    name: "Denise R.",
    detail: "Mother of the Bride, 2025",
  },
];

/* --- Gallery images (placeholder Unsplash) --- */
export const gallery = [
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
];

/* --- FAQ --- */
export const faqs = [
  {
    q: "Is the venue truly all-in-one?",
    a: "Yes. Your rehearsal dinner, ceremony, cocktail hour, reception, and overnight stay all happen on one property — no shuttling guests between locations, no rushing home at the end of the night.",
  },
  {
    q: "How many guests can you host?",
    a: "The Barn seats up to 200 for dinner, and the orchard lawn holds ceremonies up to roughly 220. The farmhouse sleeps up to 25 guests overnight.",
  },
  {
    q: "What happens if it rains?",
    a: "The covered porch is a beautiful rain-or-shine ceremony option, and the climate-controlled barn means your celebration is comfortable in any season.",
  },
  {
    q: "Can we bring our own vendors?",
    a: "Absolutely. You're welcome to bring your own caterer and vendors, or work from our curated preferred list. We'll help you build the right team.",
  },
  {
    q: "How far in advance do dates book?",
    a: "Peak Saturdays (May–October) typically book 12–18 months out. Use the date checker on this page and we'll confirm availability right away.",
  },
];

/* ============================================================================
   VENDOR MARKETPLACE — a curated ecosystem of trusted local partners.
   The twist: this is a two-sided revenue engine. Vendors apply to be listed,
   "Preferred" partners pay a membership or referral commission, and the venue
   becomes the hub of the local wedding economy. Couples get a vetted dream team;
   the venue earns referral income AND becomes stickier (one-stop planning).
   ============================================================================ */

export type VendorTier = "preferred" | "featured" | "listed";

export type VendorCategory = {
  slug: string;
  name: string;
  icon: string; // lucide icon name, resolved in the page
  blurb: string;
};

export const vendorCategories: VendorCategory[] = [
  { slug: "photography", name: "Photography & Video", icon: "Camera", blurb: "Storytellers who know our light." },
  { slug: "catering", name: "Catering & Bar", icon: "UtensilsCrossed", blurb: "Farm-to-table menus & mixology." },
  { slug: "florals", name: "Florals & Design", icon: "Flower2", blurb: "Blooms that echo the orchard." },
  { slug: "music", name: "Music & Entertainment", icon: "Music", blurb: "DJs, bands & ceremony strings." },
  { slug: "planning", name: "Planners & Coordinators", icon: "ClipboardList", blurb: "Day-of and full-service pros." },
  { slug: "beauty", name: "Hair & Makeup", icon: "Sparkles", blurb: "Get-ready-glam on-site." },
  { slug: "cake", name: "Cake & Sweets", icon: "Cake", blurb: "Showstoppers & dessert tables." },
  { slug: "rentals", name: "Rentals & Decor", icon: "Armchair", blurb: "Lounges, lighting & the extras." },
];

export type Vendor = {
  id: string;
  name: string;
  category: string; // category slug
  tier: VendorTier;
  tagline: string;
  location: string;
  rating: number;
  reviews: number;
  priceBand: "$" | "$$" | "$$$";
  image: string;
  bookedWithUs: number; // how many Farm 1893 couples used them — trust signal
};

export const vendors: Vendor[] = [
  { id: "V-01", name: "Amberlight Photography", category: "photography", tier: "preferred", tagline: "Golden-hour specialists who've shot 40+ weddings here.", location: "Sandusky, OH", rating: 5.0, reviews: 128, priceBand: "$$", image: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=800&q=80", bookedWithUs: 41 },
  { id: "V-02", name: "Harvest & Hearth Catering", category: "catering", tier: "preferred", tagline: "Seasonal farm-to-table menus sourced from local growers.", location: "Berlin Heights, OH", rating: 4.9, reviews: 96, priceBand: "$$", image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80", bookedWithUs: 33 },
  { id: "V-03", name: "Wildbloom Floral Co.", category: "florals", tier: "featured", tagline: "Garden-style arrangements that echo the heritage orchard.", location: "Huron, OH", rating: 5.0, reviews: 74, priceBand: "$$", image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=800&q=80", bookedWithUs: 27 },
  { id: "V-04", name: "The Northcoast DJs", category: "music", tier: "preferred", tagline: "Reading the room since 2009 — barns are our specialty.", location: "Cleveland, OH", rating: 4.8, reviews: 152, priceBand: "$$", image: "https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?auto=format&fit=crop&w=800&q=80", bookedWithUs: 38 },
  { id: "V-05", name: "Ever After Planning", category: "planning", tier: "featured", tagline: "Full-service planners who know every inch of the farm.", location: "Toledo, OH", rating: 5.0, reviews: 61, priceBand: "$$$", image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80", bookedWithUs: 22 },
  { id: "V-06", name: "Gilded Grace Beauty", category: "beauty", tier: "listed", tagline: "On-site hair & makeup for the whole party.", location: "Sandusky, OH", rating: 4.9, reviews: 88, priceBand: "$$", image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80", bookedWithUs: 19 },
  { id: "V-07", name: "Sugar Maple Bakehouse", category: "cake", tier: "featured", tagline: "Heirloom-recipe cakes & orchard-fruit dessert tables.", location: "Norwalk, OH", rating: 5.0, reviews: 54, priceBand: "$", image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80", bookedWithUs: 24 },
  { id: "V-08", name: "Lantern & Co. Rentals", category: "rentals", tier: "listed", tagline: "Vintage lounges, festoon lighting & statement pieces.", location: "Cleveland, OH", rating: 4.7, reviews: 43, priceBand: "$$", image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=800&q=80", bookedWithUs: 15 },
];
