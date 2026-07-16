/* ============================================================================
   SILO STAYS — the four restored grain silos as short-term rentals.
   A separate "book-direct" vacation-rental experience that flows into the same
   CRM, tagging every guest as VRBO (not Wedding) for year-after-year re-engagement.
   Placeholder content — swap real names, rates, and photos in this one file.
   ============================================================================ */

export type Silo = {
  slug: string;
  name: string;
  tagline: string;
  sleeps: number;
  beds: number;
  baths: number;
  nightly: number;
  cleaningFee: number;
  minNights: number;
  rating: number;
  reviews: number;
  hero: string;
  gallery: string[];
  description: string[];
  amenities: string[];
  houseRules: string[];
  petFriendly: boolean;
};

const BASE_AMENITIES = [
  "Fast Wi-Fi", "Full kitchen", "Smart TV", "Central heat & A/C",
  "Free on-site parking", "Coffee bar", "Orchard & silo views", "Private fire pit",
];

export const silos: Silo[] = [
  {
    slug: "the-orchard-silo",
    name: "The Orchard Silo",
    tagline: "A cozy round retreat for two, tucked into the apple trees.",
    sleeps: 2, beds: 1, baths: 1, nightly: 189, cleaningFee: 85, minNights: 2,
    rating: 4.97, reviews: 128,
    hero: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80",
    ],
    description: [
      "Wake to sunlight curving across round timber walls and the smell of apple blossom. The Orchard Silo is our most intimate stay — a lovingly restored grain silo reimagined as a romantic escape for two.",
      "Sip coffee on the private deck, wander the orchard rows, and end the night by the fire pit under a wide Ohio sky.",
    ],
    amenities: [...BASE_AMENITIES, "Queen bed", "Rainfall shower", "Record player"],
    houseRules: ["Check-in 4 PM · Check-out 11 AM", "No smoking indoors", "Quiet hours 10 PM–8 AM", "2 guests max"],
    petFriendly: false,
  },
  {
    slug: "the-harvest-silo",
    name: "The Harvest Silo",
    tagline: "Room for the whole family, with a loft the kids will fight over.",
    sleeps: 4, beds: 2, baths: 1, nightly: 249, cleaningFee: 110, minNights: 2,
    rating: 4.92, reviews: 96,
    hero: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1616137466211-f939a420be84?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=80",
    ],
    description: [
      "The Harvest Silo pairs rustic charm with real family comfort: a queen suite below, a cozy loft with two twins above, and a farmhouse kitchen made for pancake mornings.",
      "Lawn games, a fire pit, and the whole farm to explore make this the easiest weekend getaway you'll book all year.",
    ],
    amenities: [...BASE_AMENITIES, "Sleeps 4", "Loft with twin beds", "Board games", "BBQ grill"],
    houseRules: ["Check-in 4 PM · Check-out 11 AM", "No smoking indoors", "Quiet hours 10 PM–8 AM", "4 guests max"],
    petFriendly: true,
  },
  {
    slug: "the-copper-silo",
    name: "The Copper Silo",
    tagline: "Our luxe silo — a soaking tub, a loft, and a whole lot of romance.",
    sleeps: 2, beds: 1, baths: 2, nightly: 279, cleaningFee: 95, minNights: 2,
    rating: 5.0, reviews: 74,
    hero: "https://images.unsplash.com/photo-1595877244574-e90ce41ce089?auto=format&fit=crop&w=1800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=900&q=80",
    ],
    description: [
      "Warm copper accents, a freestanding soaking tub, and a sky-lit sleeping loft make The Copper Silo our most indulgent stay — the one couples come back to for anniversaries.",
      "Uncork something local, sink into the tub, and let the farm work its quiet magic.",
    ],
    amenities: [...BASE_AMENITIES, "King bed", "Soaking tub", "Wet bar", "Skylight loft"],
    houseRules: ["Check-in 4 PM · Check-out 11 AM", "No smoking indoors", "Quiet hours 10 PM–8 AM", "Adults preferred"],
    petFriendly: false,
  },
  {
    slug: "the-meadow-silo",
    name: "The Meadow Silo",
    tagline: "The big one — three bedrooms for the reunion, retreat, or crew.",
    sleeps: 6, beds: 3, baths: 2, nightly: 329, cleaningFee: 140, minNights: 2,
    rating: 4.9, reviews: 61,
    hero: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80",
    ],
    description: [
      "Our largest silo sleeps six across three bedrooms, with an open kitchen and a big harvest table built for long dinners and longer conversations.",
      "Ideal for family reunions, girls' weekends, and small corporate retreats that want the whole farm to themselves.",
    ],
    amenities: [...BASE_AMENITIES, "Sleeps 6", "3 bedrooms", "Dishwasher", "Washer & dryer", "Large deck"],
    houseRules: ["Check-in 4 PM · Check-out 11 AM", "No smoking indoors", "Quiet hours 10 PM–8 AM", "6 guests max"],
    petFriendly: true,
  },
];

export function getSilo(slug: string): Silo | null {
  return silos.find((s) => s.slug === slug) ?? null;
}

/* --- Sample guest reviews --- */
export const siloReviews = [
  { name: "Rachel M.", stay: "The Copper Silo", text: "The most peaceful two nights we've had in years. The tub, the quiet, the orchard walks — we already rebooked for our anniversary.", rating: 5 },
  { name: "The Delgado Family", stay: "The Harvest Silo", text: "Our kids are still talking about sleeping in the loft. Spotless, cozy, and the fire pit at night was perfect.", rating: 5 },
  { name: "Jordan & Wren", stay: "The Orchard Silo", text: "Booked direct and saved, which was a nice bonus. Felt like our own little world for the weekend.", rating: 5 },
];

/* --- CRM: sample VRBO (Silo Stays) guests --- */
export type SiloGuest = {
  id: string;
  name: string;
  email: string;
  silo: string;
  checkIn: string;
  nights: number;
  total: number;
  status: "upcoming" | "staying" | "past";
  repeat: boolean;
};

export const siloGuests: SiloGuest[] = [
  { id: "R-3012", name: "Rachel & Mark Ellison", email: "rachel.e@email.com", silo: "The Copper Silo", checkIn: "2026-08-14", nights: 2, total: 653, status: "upcoming", repeat: true },
  { id: "R-3011", name: "The Delgado Family", email: "delgados@email.com", silo: "The Harvest Silo", checkIn: "2026-07-25", nights: 3, total: 857, status: "upcoming", repeat: false },
  { id: "R-3010", name: "Jordan & Wren", email: "jwren@email.com", silo: "The Orchard Silo", checkIn: "2026-07-11", nights: 2, total: 463, status: "staying", repeat: true },
  { id: "R-3009", name: "Sam Whitaker", email: "sam.w@email.com", silo: "The Meadow Silo", checkIn: "2026-06-20", nights: 2, total: 798, status: "past", repeat: false },
  { id: "R-3008", name: "The Okafor Reunion", email: "okafor@email.com", silo: "The Meadow Silo", checkIn: "2026-05-16", nights: 3, total: 1127, status: "past", repeat: true },
];

export const siloStats = {
  occupancyRate: 78,
  nightlyRevenueMTD: 14260,
  repeatGuestRate: 42,
  avgRating: 4.95,
};
