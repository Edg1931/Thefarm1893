/* ============================================================================
   THE JOURNAL — the venue's SEO content engine.
   Full, genuinely useful articles that rank for the searches couples actually
   make (Ohio wedding venue, weekend weddings, fall palettes, venue questions)
   and keep them on the site. Rich, structured content with headings + internal
   links. In production, new posts are drafted in the AI Marketing Studio.
   ============================================================================ */

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string } // supports inline [label](/path) links
  | { type: "list"; items: string[] };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMins: number;
  date: string;        // ISO — first published
  updated?: string;    // ISO — last updated
  cover: string;
  author: string;
  metaTitle: string;         // <title> for search
  metaDescription: string;   // meta description for search
  keywords: string[];
  content: Block[];
};

const AUTHOR = "The Farm 1893 Team";

export const posts: Post[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "why-a-weekend-wedding-changes-everything",
    title: "Why a Weekend Wedding Changes Everything",
    excerpt:
      "The clock is the quiet villain of most wedding days. Here's how a two-night celebration in the orchard gives you the one thing you can't buy back — time.",
    category: "Planning",
    readMins: 7,
    date: "2026-06-02",
    updated: "2026-07-10",
    cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    author: AUTHOR,
    metaTitle: "Weekend Weddings: Why a 2-Night Celebration Beats a One-Day Wedding",
    metaDescription:
      "A weekend wedding gives you more time, less stress, and a real reunion with your guests. Here's what a Friday-to-Sunday celebration looks like at an all-inclusive Ohio orchard venue — and whether it's right for you.",
    keywords: ["weekend wedding", "all-inclusive wedding venue Ohio", "multi-day wedding", "wedding weekend", "Berlin Heights wedding venue", "orchard wedding"],
    content: [
      { type: "p", text: "Ask any married couple what they would change about their wedding day, and you'll hear the same answer again and again: it went by too fast. One day — often just six or eight hours of venue access — has to hold the ceremony, the photos, the dinner, the dancing, and every hug you meant to give. By the time you finally exhale, the DJ is playing the last song." },
      { type: "p", text: "A weekend wedding rewrites that story. Instead of racing a single afternoon, you settle into two full nights and three days at one property. The result isn't just a longer wedding — it's a fundamentally calmer, more connected one. Here's why more couples are choosing the weekend, what it actually looks like, and how to decide if it's right for you." },

      { type: "h2", text: "The hidden problem with the one-day wedding" },
      { type: "p", text: "The single-day timeline is built around a countdown. Vendors arrive on a tight window, the couple is shuttled from photo to photo, and every delay — a late hairstylist, a long receiving line — eats into the reception. Couples routinely tell us the day felt like a beautiful blur they watched from the outside." },
      { type: "p", text: "It also compresses the part that matters most: time with the people you invited. When you only have a few hours, you can't actually talk to 120 guests. You wave, you hug, you move on. The wedding happens to you rather than with you." },

      { type: "h2", text: "What a weekend wedding actually looks like" },
      { type: "p", text: "At [The Farm 1893](/weddings), a weekend celebration unfolds over 44 hours of exclusive use — Friday afternoon to Sunday morning. A typical flow looks like this:" },
      { type: "list", items: [
        "Friday: Arrive by mid-afternoon, decorate at your own pace, hold the rehearsal in the orchard, and gather for a relaxed rehearsal dinner and bonfire. Your wedding party stays overnight in the farmhouse.",
        "Saturday: An unhurried morning getting ready, a golden-hour ceremony beneath the heritage apple trees, dinner and dancing in the restored barn — and no one rushing to leave, because the party is already home.",
        "Sunday: A slow farewell brunch with your favorite people before an 11 a.m. checkout. No frantic teardown, no driving home exhausted at midnight.",
      ]},
      { type: "p", text: "Because the whole property is yours, the celebration never really stops between events. The barn, the orchard, the fire pits, and the [farmhouse and silo stays](/silos) that sleep your inner circle are all in one place." },

      { type: "h2", text: "The benefits couples notice most" },
      { type: "p", text: "More time with guests. When people stay on-site, you get real conversations, not a two-second hug in a receiving line. A weekend feels like a family reunion that happens to include a wedding." },
      { type: "p", text: "Less stress on the day. With Friday for setup and rehearsal, Saturday isn't a logistics scramble. Vendors load in early, and your morning is calm instead of frantic." },
      { type: "p", text: "Better photos, naturally. Golden hour in an orchard doesn't need to be rushed. And the candid, in-between moments — the bonfire, the Sunday brunch — are often the images couples cherish most." },
      { type: "p", text: "A gift to out-of-town guests. Instead of flying in and out for a single evening, traveling guests get a genuine getaway in the Ohio countryside, with somewhere to stay right on the property." },

      { type: "h2", text: "Is a weekend wedding more expensive?" },
      { type: "p", text: "Not the way most couples assume. A one-day venue rental looks cheaper on paper, but by the time you add a separate rehearsal-dinner venue, hotel blocks, transportation, and the rentals that a bare space requires, the numbers converge — and the all-inclusive weekend often comes out ahead. Because our packages bundle the grounds, tables and chairs, and a day-of coordinator, there are fewer surprise line items. You can see exactly what's included on our [pricing page](/pricing)." },

      { type: "h2", text: "Who a weekend wedding is (and isn't) for" },
      { type: "p", text: "It's a natural fit for couples who want their people around them, who have out-of-town guests, or who simply refuse to let the best day of their lives disappear in a blur. It's less essential if you're planning a small weekday elopement or a tightly budgeted micro-wedding — though even then, a two-night stay can be a beautiful honeymoon-adjacent escape." },
      { type: "p", text: "If any of this sounds like the wedding you've been picturing, the best next step is to feel it in person. Walk the orchard, stand in the barn, and imagine your Friday-to-Sunday. [Book a private tour](/contact) and we'll show you exactly how your weekend could unfold." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "the-best-fall-wedding-color-palettes",
    title: "The Best Fall Wedding Color Palettes for an Orchard Setting",
    excerpt:
      "Terracotta and sage. Emerald and gold. Here are the autumn palettes that sing against heritage apple trees — and how to preview yours before you book.",
    category: "Design",
    readMins: 6,
    date: "2026-05-18",
    updated: "2026-07-05",
    cover: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80",
    author: AUTHOR,
    metaTitle: "5 Best Fall Wedding Color Palettes for an Orchard Wedding (Ohio)",
    metaDescription:
      "The autumn wedding palettes that look stunning against an orchard and barn — terracotta & sage, emerald & gold, and more — with tips on florals, linens, and lighting. Plus how to preview your colors before you book.",
    keywords: ["fall wedding colors", "autumn wedding color palette", "Ohio fall wedding", "orchard wedding", "terracotta and sage wedding", "emerald and gold wedding", "barn wedding colors"],
    content: [
      { type: "p", text: "There's a reason autumn is the most-requested wedding season in Ohio: the light turns golden, the orchard blushes, and every color feels warmer. But a fall palette only sings when it plays with that natural backdrop instead of fighting it. Choose colors that echo the apple trees, the weathered barn wood, and the low October sun, and your whole wedding looks effortlessly cohesive — in person and in photos." },
      { type: "p", text: "Below are five fall palettes that look especially beautiful in an orchard-and-barn setting, what each one evokes, and how to bring it to life. If you want to see any of them on a real mood board, our [Design My Day studio](/design-my-day) lets you preview your wedding in any palette before you ever tour." },

      { type: "h2", text: "How to choose a palette that works with the landscape" },
      { type: "p", text: "Before you fall for a Pinterest board, look at where you'll actually stand. An orchard ceremony is already full of green leaves, brown bark, and golden light. A barn reception adds warm wood tones and string-light amber. The palettes that photograph best either harmonize with those tones (earthy, organic) or contrast them intentionally (jewel-toned, moody). Fluorescent brights and cool pastels tend to clash with the warmth of the setting." },

      { type: "h2", text: "1. Terracotta & Sage — earthy and organic" },
      { type: "p", text: "Sun-baked clay softened by muted green, with cream and brass accents. This is the palette that feels most at home among our apple trees — it looks like the landscape itself. It's forgiving for mixed bridesmaid dresses, it flatters every skin tone, and it pairs beautifully with dried grasses, pampas, and seasonal blooms like dahlias and ranunculus." },

      { type: "h2", text: "2. Emerald & Gold — moody and opulent" },
      { type: "p", text: "The opposite direction: deep jewel green with gold and candlelight. As the evenings cool, a candlelit barn dressed in emerald and gold feels rich and romantic. Think brass candlesticks, dark greenery, and a statement floral moment behind the sweetheart table." },

      { type: "h2", text: "3. Dusty Blue & Copper — soft with a warm spark" },
      { type: "p", text: "A cooler base of dusty, slate blue warmed by copper and rust. It's a modern, slightly unexpected fall palette that still reads seasonal thanks to the copper. It's especially pretty at golden hour, when the warm light picks up the metallic tones." },

      { type: "h2", text: "4. Burgundy & Blush — classic autumn romance" },
      { type: "p", text: "The quintessential fall wedding palette for a reason. Deep wine reds grounded with soft blush and cream feel timeless and undeniably romantic. It's a natural match for garden roses, and it looks gorgeous against both the orchard and the barn's warm wood." },

      { type: "h2", text: "5. Cream & Amber — light, airy, and golden" },
      { type: "p", text: "For couples who love a lighter look, cream, ivory, and soft amber let the golden-hour light do the work. It's understated and elegant, and it keeps a barn reception feeling bright and glowing rather than dark." },

      { type: "h2", text: "Bringing your palette to life" },
      { type: "p", text: "Once you've chosen a direction, layer it consistently across the details that guests actually see:" },
      { type: "list", items: [
        "Florals: pull two or three of your palette colors into bouquets and centerpieces, and let seasonal, locally available blooms lead.",
        "Linens & tableware: table runners, napkins, and candles are the easiest, highest-impact way to carry color across the room.",
        "Lighting: warm string lights and candlelight flatter every autumn palette; avoid cool white LEDs that fight the warmth.",
        "Attire: mismatched bridesmaid dresses in two or three palette tones read intentional and modern.",
      ]},

      { type: "h2", text: "See your palette before you book" },
      { type: "p", text: "The fastest way to fall in love with a direction is to see it on your actual venue. Our [Design My Day](/design-my-day) tool builds a mood board, color story, and styled preview in the palette you choose. Play with a few, then [come tour the farm](/contact) and stand in the space that inspired them." },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "questions-to-ask-before-booking-a-wedding-venue",
    title: "12 Questions to Ask Before You Book a Wedding Venue",
    excerpt:
      "Before you sign anything, run through this checklist. The answers separate a beautiful photo from a genuinely stress-free wedding day.",
    category: "Guides",
    readMins: 8,
    date: "2026-04-27",
    updated: "2026-07-08",
    cover: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=80",
    author: AUTHOR,
    metaTitle: "12 Questions to Ask a Wedding Venue Before You Book (2026 Checklist)",
    metaDescription:
      "A tour is dazzling by design — but the details you can't see in a photo make or break the day. Here are the 12 questions every couple should ask a wedding venue before signing, plus the red flags to watch for.",
    keywords: ["questions to ask wedding venue", "how to choose a wedding venue", "wedding venue checklist", "booking a wedding venue", "all-inclusive vs a la carte venue", "Ohio wedding venue"],
    content: [
      { type: "p", text: "A venue tour is designed to dazzle — soft light, styled tables, a coordinator who knows exactly where to walk you. But the details that actually determine whether your wedding day feels calm or chaotic are the ones you can't see in a photo. Before you put down a deposit, work through the questions below. The answers separate a beautiful backdrop from a genuinely great wedding." },

      { type: "h2", text: "The logistics questions" },
      { type: "p", text: "Start here, because these are the answers a confident venue gives without hesitation." },
      { type: "list", items: [
        "1. How many hours of access do we get — and when can vendors and decorators arrive? Short windows create rushed setups and abrupt endings.",
        "2. What is the rain (or heat) plan? For any outdoor ceremony, you need a real Plan B you'd actually be happy with — not a cramped afterthought.",
        "3. What's the true guest capacity, seated with a dance floor? A space that holds 200 standing may only seat 140 comfortably.",
        "4. Where do guests park, and is there a getting-ready space on-site? These small logistics shape the entire morning.",
        "5. Can guests stay overnight? On-site lodging changes the feel of the whole event — and keeps late-night guests safe.",
      ]},

      { type: "h2", text: "The money questions" },
      { type: "p", text: "Transparency here is the single biggest green flag. Ask directly:" },
      { type: "list", items: [
        "6. What's included versus what's an add-on? Tables, chairs, linens, setup, and teardown are common surprise costs at 'bare' venues.",
        "7. What does the payment schedule look like, and how much is the deposit? Know the total and the timing before you commit.",
        "8. Are outside vendors welcome, or is there a required list? Required-vendor lists can quietly inflate your budget.",
        "9. Are there any fees that aren't on the first page — service charges, cleaning, overtime, cake-cutting? Ask for an all-in quote.",
      ]},

      { type: "h2", text: "The experience questions" },
      { type: "p", text: "Finally, the questions that determine how the day actually feels:" },
      { type: "list", items: [
        "10. Is there a day-of coordinator included, and what exactly do they handle?",
        "11. How flexible is the timeline if we run late — and who makes that call?",
        "12. How do you handle catering, bar, accessibility, and noise ordinances? These practical answers reveal how well-run a venue really is.",
      ]},

      { type: "h2", text: "Red flags to watch for" },
      { type: "p", text: "A few answers should give you pause: vague or evasive pricing, a long list of required vendors with no flexibility, no genuine rain plan for an outdoor ceremony, or a coordinator who's really just a key-holder. If a venue can't clearly explain what happens when something goes wrong, that's your answer." },

      { type: "h2", text: "How The Farm 1893 answers these" },
      { type: "p", text: "We built our venue around exactly these questions. Weddings here are all-inclusive and rain-or-shine: you get 44 hours of exclusive access, the grounds plus tables and chairs, a day-of coordinator, on-site lodging for up to 25 of your people, and a transparent quote with no mystery fees. You can review [what's included and our packages](/pricing) up front, and see [the full weekend experience](/weddings) before you ever visit." },
      { type: "p", text: "The best way to pressure-test any venue — including ours — is to walk it with this list in hand. [Book a private tour](/contact) and ask us every one of these twelve questions. We'd rather you choose confidently than quickly." },
    ],
  },
];

export function getPost(slug: string): Post | null {
  return posts.find((p) => p.slug === slug) ?? null;
}
