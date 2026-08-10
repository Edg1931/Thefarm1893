import Image from "next/image";
import { BedDouble, Flame, Coffee, Users, Building2, TreePine, Sparkles, Check } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { gallery } from "@/lib/content";

/**
 * The farmhouse — one section, both reasons to book it.
 *
 * This used to be two separate pages: "The Stay" (/accommodations) pitched it
 * to wedding parties, and "Retreats" (/stay) pitched the same building as a
 * year-round rental. Same farmhouse, described twice, competing with itself in
 * search and forcing visitors to guess which page applied to them. Merged here
 * so the wedding-weekend and standalone-retreat cases sit side by side, which
 * is also how people actually decide.
 */

const weddingHighlights = [
  { icon: BedDouble, title: "Sleeps 25", body: "Suites for your wedding party and closest family." },
  { icon: Flame, title: "Bonfire nights", body: "Wind down under the stars around the fire pit." },
  { icon: Coffee, title: "Sunday brunch", body: "No rushing home. One last farm morning." },
];

const retreatUses = [
  { icon: Users, title: "Getaways", body: "Bachelorette weekends, milestone birthdays, friend reunions." },
  { icon: Building2, title: "Corporate retreats", body: "Off-sites with everyone under one roof." },
  { icon: TreePine, title: "Family reunions", body: "Sleeps 25 — bring everyone to the countryside." },
  { icon: Sparkles, title: "Creative & wellness", body: "Writing retreats, yoga weekends, quiet escapes." },
];

const rates = [
  { name: "Weeknight", price: "$650", per: "per night", note: "Sun–Thu · 2-night minimum", tier: "Value" },
  { name: "Off-Season Weekend", price: "$2,400", per: "Fri–Sun", note: "Nov–Apr · whole farmhouse", tier: "Popular", featured: true },
  { name: "Full Week", price: "$3,900", per: "7 nights", note: "Reunions & long stays", tier: "Best Value" },
];

const amenities = [
  "Full kitchen & dining", "Bonfire & lawn games", "Fast Wi-Fi throughout",
  "Orchard walking trails", "Pet-friendly", "Flexible check-in",
];

export function FarmhouseStay() {
  return (
    <>
      {/* The building itself — framed for both audiences */}
      <section id="farmhouse" className="bg-bone py-20 md:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <Image src={gallery[3]} alt="The farmhouse at The Farm 1893" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </Reveal>
          <Reveal delay={140}>
            <p className="eyebrow">Also on the property</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">The Farmhouse</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Sleeps 25 across the whole house, with 40 acres and total privacy around it.
              Couples take it for the wedding weekend so nobody has to drive home — and when
              there's no wedding on the calendar, it's yours for a retreat, reunion, or a
              quiet week near Lake Erie.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {weddingHighlights.map((h) => (
                <div key={h.title}>
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-sage/12 text-sage-deep"><h.icon size={20} /></div>
                  <p className="mt-3 font-medium text-ink">{h.title}</p>
                  <p className="text-sm text-ink-soft">{h.body}</p>
                </div>
              ))}
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-2.5 text-sm text-ink-soft">
              {amenities.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={15} className="shrink-0 text-sage" /> {f}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Standalone-retreat use cases */}
      <section className="bg-[color:var(--color-linen)] py-20 md:py-24">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow">No wedding required</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Rent the farmhouse on its own</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {retreatUses.map((u, i) => (
              <Reveal key={u.title} delay={(i % 4) * 80}>
                <div className="card-hover h-full rounded-2xl bg-parchment p-7 shadow-[var(--shadow-soft)]">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-sage/12 text-sage-deep"><u.icon size={22} /></div>
                  <h3 className="mt-4 font-display text-xl text-ink">{u.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{u.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Rates */}
      <section className="bg-bone py-20 md:py-24">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow">Seasonal rates</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Simple, all-in pricing</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {rates.map((r) => (
              <Reveal key={r.name}>
                <div className={`flex h-full flex-col rounded-2xl p-8 text-center ${r.featured ? "bg-[color:var(--color-ink)] text-parchment ring-2 ring-brass" : "bg-parchment shadow-[var(--shadow-soft)]"}`}>
                  <span className={`mx-auto rounded-full px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-widest ${r.featured ? "bg-brass text-ink" : "bg-sage/12 text-sage-deep"}`}>{r.tier}</span>
                  <h3 className="mt-4 font-display text-2xl">{r.name}</h3>
                  <p className="mt-3 font-display text-5xl">{r.price}</p>
                  <p className={`text-sm ${r.featured ? "text-parchment/60" : "text-stone"}`}>{r.per}</p>
                  <p className={`mt-3 text-xs ${r.featured ? "text-parchment/60" : "text-stone"}`}>{r.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-stone">
            Peak wedding-season weekends (May–Oct) are reserved for events. Rates shown are starting estimates.
          </p>
        </div>
      </section>
    </>
  );
}
