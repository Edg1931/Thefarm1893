import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { gallery, stats } from "@/lib/content";

export const metadata = { title: "Our Story" };

const timeline = [
  { year: "1893", title: "A farm takes root", body: "Rows of fruit trees are planted on the Berlin Heights land — the beginning of a legacy that would outlast generations." },
  { year: "Decades", title: "A working orchard", body: "Through changing seasons and hands, the farm feeds a community and gathers families beneath its branches." },
  { year: "Today", title: "Reborn for celebration", body: "Lovingly restored, the barn and grounds now host weddings and gatherings — honoring the past while making new memories." },
];

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Our Story"
        script="rooted in history"
        title="More than a venue — a legacy"
        subtitle="A century-old orchard, reimagined for the moments that matter most."
        heroKey="about"
        image="https://images.unsplash.com/photo-1470259078422-826894b933ad?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <Image src={gallery[5]} alt="The historic farm" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
          </Reveal>
          <Reveal delay={150}>
            <p className="eyebrow">Since 1893</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Where history meets your happily-ever-after</h2>
            <p className="mt-5 leading-relaxed text-ink-soft">
              Some places you build. Others you inherit. The Farm 1893 is both — a working
              fruit farm with more than a century of roots, thoughtfully restored into a
              modern venue that still smells of apple blossom in spring.
            </p>
            <p className="mt-4 leading-relaxed text-ink-soft">
              When you celebrate here, you become part of a story that started long before
              you — and one that will keep growing long after your last dance.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-[color:var(--color-ink)] py-20 text-parchment md:py-28">
        <div className="container-x">
          <Reveal className="text-center">
            <p className="eyebrow !text-brass-soft">The journey</p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">A century in the making</h2>
          </Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 120} className="text-center">
                <p className="font-script text-5xl text-brass-soft">{t.year}</p>
                <h3 className="mt-3 font-display text-2xl">{t.title}</h3>
                <p className="mt-3 text-parchment/70">{t.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[color:var(--color-linen)] py-16">
        <div className="container-x grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80} className="text-center">
              <p className="font-display text-4xl text-ink md:text-5xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone">{s.label}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 text-center">
          <Link href="/contact" className="btn btn-primary">Come See It For Yourself <ArrowRight size={16} /></Link>
        </Reveal>
      </section>
    </SiteShell>
  );
}
