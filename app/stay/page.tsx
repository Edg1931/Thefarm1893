import Image from "next/image";
import { Users, Sparkles, Building2, TreePine, Check } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { LeadForm } from "@/components/site/LeadForm";
import { gallery } from "@/lib/content";

export const metadata = {
  title: "Farmhouse Retreats",
  description: "Rent the private farmhouse for off-season getaways, retreats, and reunions.",
};

const rates = [
  { name: "Weeknight", price: "$650", per: "per night", note: "Sun–Thu · 2-night minimum", tier: "Value" },
  { name: "Off-Season Weekend", price: "$2,400", per: "Fri–Sun", note: "Nov–Apr · whole farmhouse", tier: "Popular", featured: true },
  { name: "Full Week", price: "$3,900", per: "7 nights", note: "Reunions & long stays", tier: "Best Value" },
];

const uses = [
  { icon: Users, title: "Girls' & Guys' Getaways", body: "Bachelorette weekends, milestone birthdays, friend reunions." },
  { icon: Building2, title: "Corporate Retreats", body: "Off-sites and team-building with everyone under one roof." },
  { icon: TreePine, title: "Family Reunions", body: "Sleeps 25 — bring the whole family to the countryside." },
  { icon: Sparkles, title: "Creative & Wellness", body: "Writing retreats, yoga weekends, and quiet escapes." },
];

export default function StayPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Farmhouse Retreats"
        script="the farm, all to yourself"
        title="Off-season getaways at The Farm 1893"
        subtitle="Not just for weddings. Rent the private farmhouse for retreats, reunions, and restful escapes — year-round."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2100&q=80"
      />

      {/* Intro */}
      <section className="bg-bone py-20 md:py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <Image src={gallery[3]} alt="Farmhouse retreat" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">Your private countryside estate</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Sleeps 25 · 40 acres · total privacy</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              When there's no wedding on the calendar, the whole farm can be yours. The restored
              farmhouse, the orchard, the bonfire, and the barn — a rare private retreat just
              steps from Lake Erie. Perfect for the getaways that bring people together.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink-soft">
              {["Full kitchen & dining", "Bonfire & lawn games", "Fast Wi-Fi throughout", "Orchard walking trails", "Pet-friendly", "Flexible check-in"].map((f) => (
                <li key={f} className="flex items-center gap-2"><Check size={16} className="text-sage" /> {f}</li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* Uses */}
      <section className="bg-[color:var(--color-linen)] py-20 md:py-24">
        <div className="container-x">
          <Reveal className="text-center"><p className="eyebrow">Perfect for</p><h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Every kind of gathering</h2></Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {uses.map((u, i) => (
              <Reveal key={u.title} delay={(i % 4) * 80}>
                <div className="card-hover h-full rounded-2xl bg-parchment p-7 shadow-[var(--shadow-soft)]">
                  <div className="grid h-13 w-13 place-items-center rounded-full bg-sage/12 p-3 text-sage-deep"><u.icon size={22} /></div>
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
          <Reveal className="text-center"><p className="eyebrow">Seasonal rates</p><h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Simple, all-in pricing</h2></Reveal>
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
          <p className="mt-6 text-center text-sm text-stone">Peak wedding-season weekends (May–Oct) are reserved for events. Rates shown are starting estimates.</p>
        </div>
      </section>

      {/* Inquiry */}
      <section className="bg-[color:var(--color-ink)] py-20 md:py-24">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <Reveal className="text-parchment">
            <p className="eyebrow !text-brass-soft">Book your retreat</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">Reserve the farmhouse</h2>
            <p className="mt-4 max-w-md text-parchment/75">Tell us your dates and group — we'll confirm availability and send a simple retreat quote. No wedding required.</p>
          </Reveal>
          <Reveal delay={120}><LeadForm /></Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
