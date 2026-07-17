import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BedDouble, Coffee, Flame, Sun } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { SiloCrossPromo } from "@/components/site/CrossPromo";
import { gallery } from "@/lib/content";

export const metadata = { title: "The Stay" };

const highlights = [
  { icon: BedDouble, title: "Sleeps 25", body: "Beautifully appointed suites for your wedding party and closest family." },
  { icon: Sun, title: "Golden-hour prep", body: "Wake up on the farm and get ready in rooms full of morning light." },
  { icon: Flame, title: "Bonfire nights", body: "Wind down under the stars around the fire pit — s'mores encouraged." },
  { icon: Coffee, title: "Sunday brunch", body: "No rushing home. Linger over coffee and one last farm morning." },
];

export default function AccommodationsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="The Stay"
        script="stay a little longer"
        title="The Farmhouse"
        subtitle="Your people, together under one roof — from the rehearsal night to the farewell brunch."
        image="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <Image src={gallery[3]} alt="Farmhouse interior" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </Reveal>
          <Reveal delay={150}>
            <p className="eyebrow">Overnight on the farm</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Make it a weekend to remember</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Our on-site farmhouse sleeps up to 25 guests, so the people who matter most
              never have to leave. It's the difference between a wedding day and a wedding
              weekend — and it's the part our couples say they'll never forget.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {highlights.map((h) => (
                <div key={h.title} className="flex gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage/12 text-sage-deep"><h.icon size={20} /></div>
                  <div>
                    <p className="font-medium text-ink">{h.title}</p>
                    <p className="text-sm text-ink-soft">{h.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/contact" className="btn btn-primary mt-9">Reserve Your Weekend <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>

      <SiloCrossPromo heading="Or stay in a silo" />
    </SiteShell>
  );
}
