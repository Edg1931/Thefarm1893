import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Heart, Gift, BedDouble, CalendarHeart } from "lucide-react";
import { getCelebration } from "@/lib/celebrations";
import { getBudget } from "@/lib/crm/lodging";
import { getRegistry } from "@/lib/crm/registry";
import { GuestRoomBooking } from "@/components/GuestRoomBooking";
import { RegistryBoard } from "@/components/RegistryBoard";
import { SiloCrossPromo } from "@/components/site/CrossPromo";
import { RsvpForm } from "@/components/site/RsvpForm";
import { Countdown } from "@/components/site/Countdown";
import { Reveal } from "@/components/site/Reveal";
import { Logo } from "@/components/site/Logo";
import { business } from "@/lib/content";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCelebration(slug);
  return { title: c ? `${c.couple} · ${formatDate(c.date)}` : "Celebration" };
}

export default async function CelebrationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCelebration(slug);
  if (!c) notFound();
  const budget = getBudget(slug);
  const registry = getRegistry(slug);

  return (
    <div className="bg-bone">
      {/* Hero */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <Image src={c.hero} alt="" fill priority className="animate-zoom object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/60" />
        <div className="relative z-10 px-6 text-center text-white">
          <p className="animate-fade font-script text-4xl text-brass-soft md:text-5xl">together with joy</p>
          <h1 className="animate-rise delay-1 mt-2 font-display text-6xl md:text-8xl">{c.couple}</h1>
          <p className="animate-rise delay-2 mt-4 text-lg uppercase tracking-[0.3em] text-white/85">{formatDate(c.date)} · The Farm 1893</p>
          <div className="animate-rise delay-3 mt-10 flex justify-center"><Countdown date={c.date} /></div>
          <a href="#rsvp" className="animate-rise delay-4 btn bg-parchment text-ink mt-10">RSVP <Heart size={16} /></a>
        </div>
      </section>

      {/* Welcome */}
      <section className="container-x py-20 text-center md:py-28">
        <Reveal className="mx-auto max-w-2xl">
          <CalendarHeart className="mx-auto text-brass" />
          <p className="mt-5 font-display text-3xl leading-snug text-ink md:text-4xl">{c.welcome}</p>
          <p className="mt-6 font-script text-3xl text-brass">{c.hashtag}</p>
        </Reveal>
      </section>

      {/* Schedule */}
      <section className="bg-[color:var(--color-ink)] py-20 text-parchment md:py-28">
        <div className="container-x">
          <Reveal className="text-center"><p className="eyebrow !text-brass-soft">The weekend</p><h2 className="mt-3 font-display text-4xl md:text-5xl">Schedule of events</h2></Reveal>
          <div className="mx-auto mt-14 max-w-2xl space-y-2">
            {c.schedule.map((s, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="flex gap-5 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                  <div className="w-28 shrink-0 text-brass-soft"><p className="text-sm font-medium uppercase tracking-wider">{s.time}</p></div>
                  <div><p className="font-display text-2xl">{s.title}</p><p className="mt-1 text-sm text-parchment/70">{s.detail}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lodging + Local */}
      <section className="container-x grid gap-12 py-20 md:grid-cols-2 md:py-28">
        <Reveal>
          <div className="flex items-center gap-2 text-brass"><BedDouble size={18} /><span className="eyebrow">Staying on-site</span></div>
          <h2 className="mt-3 font-display text-3xl text-ink">Farmhouse rooms</h2>
          <ul className="mt-6 space-y-3">
            {c.rooms.map((r) => (
              <li key={r.name} className="flex items-center justify-between rounded-xl bg-parchment p-4 shadow-[var(--shadow-soft)]">
                <span className="font-medium text-ink">{r.name}</span><span className="text-sm text-stone">{r.guests}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <div className="flex items-center gap-2 text-brass"><MapPin size={18} /><span className="eyebrow">Make a weekend of it</span></div>
          <h2 className="mt-3 font-display text-3xl text-ink">Around Berlin Heights</h2>
          <ul className="mt-6 space-y-3">
            {c.local.map((l) => (
              <li key={l.name} className="rounded-xl bg-parchment p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between"><span className="font-medium text-ink">{l.name}</span><span className="rounded-full bg-sage/12 px-2.5 py-0.5 text-xs text-sage-deep">{l.type}</span></div>
                <p className="mt-1 text-sm text-stone">{l.note}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* Reserve your room — guests pay individually for their stay */}
      {budget && (
        <section className="bg-[color:var(--color-ink)] py-20 text-parchment md:py-28">
          <div className="container-x max-w-4xl">
            <Reveal className="text-center">
              <BedDouble className="mx-auto text-brass-soft" />
              <p className="eyebrow mt-4 !text-brass-soft">Stay on the farm</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl">Reserve your room</h2>
              <p className="mx-auto mt-3 max-w-lg text-parchment/70">
                Make a weekend of it! The farmhouse sleeps everyone on-site. Claim a room and pay
                for just your own stay — no rushing home after the last dance.
              </p>
            </Reveal>
            <div className="mt-10"><GuestRoomBooking rooms={budget.rooms.filter((r) => r.type !== "silo")} /></div>
          </div>
        </section>
      )}

      {/* Cross-promo: guests can book a silo for the weekend (subtle) */}
      <SiloCrossPromo heading="Make a weekend of it" />

      {/* Registry — gift toward the wedding, right on the site */}
      {registry && (
        <section id="registry" className="bg-bone py-20 md:py-28">
          <div className="container-x">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Gift className="mx-auto text-brass" />
              <p className="eyebrow mt-4">The registry</p>
              <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Give a gift that matters</h2>
              <p className="mx-auto mt-3 max-w-lg text-ink-soft">{registry.intro}</p>
            </Reveal>
            <div className="mt-12"><RegistryBoard funds={registry.funds} /></div>
          </div>
        </section>
      )}

      {/* RSVP */}
      <section id="rsvp" className="bg-[color:var(--color-sage-deep)] py-20 text-parchment md:py-28">
        <div className="container-x max-w-xl text-center">
          <Reveal>
            <Gift className="mx-auto text-brass-soft" />
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Will you join us?</h2>
            <p className="mt-3 text-parchment/75">Kindly reply by August 1, 2026.</p>
            <RsvpForm coupleName={c.couple} />
            <a href="#registry" className="mt-6 inline-flex items-center gap-2 rounded-full bg-parchment/10 px-5 py-2.5 text-sm text-brass-soft ring-1 ring-brass/30 transition hover:bg-parchment/20">
              <Gift size={15} /> Browse our registry &amp; gift funds →
            </a>
          </Reveal>
        </div>
      </section>

      {/* Footer — subtle venue branding = the marketing payload */}
      <footer className="container-x flex flex-col items-center gap-4 py-12 text-center">
        <Logo />
        <p className="text-sm text-stone">Celebrated at {business.name} · {business.city}, {business.region}</p>
        <Link href="/" className="btn btn-ghost !py-2.5 !text-xs">Planning your own? Explore the farm →</Link>
      </footer>
    </div>
  );
}
