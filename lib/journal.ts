/* ============================================================================
   THE JOURNAL — the venue's content engine.
   SEO-friendly stories that pull couples in from Google & Pinterest and keep
   them on the site. In production, posts are drafted in the CRM's AI Marketing
   Studio and published here. Demo posts below use polished placeholder copy.
   ============================================================================ */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMins: number;
  date: string; // ISO
  cover: string;
  body: string[]; // paragraphs
};

export const posts: Post[] = [
  {
    slug: "why-a-weekend-wedding-changes-everything",
    title: "Why a Weekend Wedding Changes Everything",
    excerpt:
      "The clock is the quiet villain of most wedding days. Here's how a two-night celebration in the orchard gives you the one thing you can't buy back — time.",
    category: "Planning",
    readMins: 5,
    date: "2026-06-02",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    body: [
      "Ask any couple what they'd change about their wedding, and you'll hear the same answer again and again: it went by too fast. The day is a blur of hair appointments, hidden timelines, and a photographer tapping their watch. By the time you exhale, the DJ is playing the last song.",
      "A weekend wedding rewrites that story. When you arrive Friday afternoon and don't leave until Sunday brunch, the pressure lifts. There's time for a real rehearsal dinner, an unhurried morning getting ready, and a bonfire that stretches past midnight because nobody has to drive home.",
      "At The Farm 1893, the whole property — the restored barn, the heritage orchard, and the farmhouse that sleeps twenty-five — becomes yours for the weekend. Your favorite people stay on-site, so the celebration never really stops.",
      "The result isn't just a wedding. It's a reunion, a slow exhale, and a set of memories that don't end when the reception does. That's the difference a weekend makes.",
    ],
  },
  {
    slug: "the-best-fall-wedding-color-palettes",
    title: "The Best Fall Wedding Color Palettes for an Orchard Setting",
    excerpt:
      "Terracotta and sage. Emerald and gold. Here are the autumn palettes that sing against heritage apple trees — and how to see yours before you book.",
    category: "Design",
    readMins: 4,
    date: "2026-05-18",
    cover: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80",
    body: [
      "There's a reason autumn is the most requested wedding season in Ohio: the light goes golden, the orchard turns, and every color feels warmer. Choosing a palette that plays with that natural backdrop is the fastest way to a cohesive, editorial look.",
      "Terracotta & Sage leans earthy and organic — sun-baked clay tones softened by muted green. It's the palette that feels most at home among our apple trees.",
      "Emerald & Gold goes the other direction: moody, opulent, and jewel-toned, perfect for a candlelit barn reception as the evenings cool.",
      "Not sure which is yours? Our Design My Day studio lets you preview your wedding in any palette — mood board, color story, and all — before you ever tour. It's the easiest way to fall in love with a direction.",
    ],
  },
  {
    slug: "questions-to-ask-before-booking-a-wedding-venue",
    title: "12 Questions to Ask Before You Book a Wedding Venue",
    excerpt:
      "Before you sign anything, run through this checklist. The answers separate a beautiful photo from a stress-free wedding day.",
    category: "Guides",
    readMins: 6,
    date: "2026-04-27",
    cover: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80",
    body: [
      "A venue tour is dazzling by design — but the details you can't see in a photo are the ones that make or break the day. Here's what to ask before you commit.",
      "Start with logistics: What's the rain plan? How many hours of access do you get? Is there a getting-ready space, and where do guests park? A great venue answers these without hesitation.",
      "Then the money questions: What's included versus what's an add-on? When are payments due? Are outside vendors welcome, or is there a required list? Transparency here is a green flag.",
      "Finally, the experience: Is there a day-of coordinator? Can guests stay overnight? What happens if you run late? At The Farm 1893, the answers are all-in-one, rain-or-shine, and yes — your people can stay the whole weekend.",
    ],
  },
];

export function getPost(slug: string): Post | null {
  return posts.find((p) => p.slug === slug) ?? null;
}
