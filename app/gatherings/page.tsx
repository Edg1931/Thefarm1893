import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Briefcase, Cake, Heart, Users, Sparkles, Leaf } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { gallery } from "@/lib/content";

// Hero images come from Supabase Storage (heroes/<page>.jpg). Without this
// the hero is baked at build time, so a newly uploaded photo would never
// appear until the next deploy.
export const revalidate = 60;

export const metadata = { title: "Gatherings & Events" };

const events = [
  { icon: Briefcase, title: "Corporate Retreats", body: "Off-sites, team-building, and leadership summits with lodging on-site and zero distractions." },
  { icon: Cake, title: "Milestone Celebrations", body: "Anniversaries, birthdays, and reunions that deserve more than a banquet hall." },
  { icon: Heart, title: "Showers & Engagements", body: "Bridal and baby showers, engagement parties, and rehearsal dinners in the orchard." },
  { icon: Leaf, title: "Celebrations of Life", body: "A peaceful, natural setting to gather, remember, and honor a life well lived." },
  { icon: Users, title: "Nonprofit & Community", body: "Fundraisers, galas, and community gatherings with room to host and inspire." },
  { icon: Sparkles, title: "Holiday & Seasonal", body: "Company holiday parties and seasonal soirées in the string-lit barn." },
];

export default function GatheringsPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Gatherings & Events"
        script="every reason to gather"
        title="More than weddings"
        subtitle="From corporate retreats to milestone celebrations, the farm is built to bring people together."
        heroKey="gatherings"
        image="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-28">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What we host</p>
            <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Space for every occasion</h2>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e, i) => (
              <Reveal key={e.title} delay={(i % 3) * 90}>
                <div className="card-hover h-full rounded-2xl bg-parchment p-8 shadow-[var(--shadow-soft)]">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-sage/12 text-sage-deep">
                    <e.icon size={24} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-ink">{e.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{e.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24 md:py-32">
        <Image src={gallery[6]} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[color:var(--color-ink)]/72" />
        <div className="container-x relative z-10 text-center text-parchment">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-display text-4xl md:text-5xl">Planning something special?</h2>
            <p className="mx-auto mt-4 max-w-lg text-parchment/75">Tell us your vision and we'll craft a custom proposal for your event.</p>
            <Link href="/contact" className="btn bg-parchment text-ink mt-8">Start Planning <ArrowRight size={16} /></Link>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
