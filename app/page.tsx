import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, Check, Quote, Clock, Sparkles, Wand2, CalendarCheck, Handshake, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { DateChecker } from "@/components/site/DateChecker";
import { GuideCapture } from "@/components/site/GuideCapture";
import {
  business, stats, spaces, packages, testimonials, gallery, amenities,
} from "@/lib/content";

const HERO =
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=2100&q=80";

const weekend = [
  { day: "Friday", time: "3:00 PM", title: "Arrive & Rehearse", body: "The whole farm becomes yours. Rehearsal dinner under the string lights, first night in the farmhouse." },
  { day: "Saturday", time: "All day", title: "Your Wedding Day", body: "Get ready in the suites, say 'I do' in the orchard, dance in the barn, gather round the bonfire." },
  { day: "Sunday", time: "11:00 AM", title: "Slow Farewell", body: "Brunch with your favorite people. No rushing home — just one last morning on the farm." },
];

export default function Home() {
  return (
    <SiteShell>
      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image src={HERO} alt="Golden-hour wedding ceremony in the orchard at The Farm 1893" fill priority className="animate-zoom object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/25 to-black/60" />
        </div>

        <div className="container-x relative z-10 text-center text-white">
          <p className="animate-fade eyebrow !text-brass-soft">Berlin Heights · Ohio · Est. 1893</p>
          <h1 className="animate-rise delay-1 mx-auto mt-5 max-w-4xl font-display text-5xl leading-[1.02] sm:text-6xl md:text-7xl lg:text-[5.2rem]">
            {business.heroHeadline}
          </h1>
          <p className="animate-rise delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {business.heroSub}
          </p>
          <div className="animate-rise delay-3 mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/contact" className="btn bg-parchment text-ink hover:bg-white">
              Book a Private Tour <ArrowRight size={16} />
            </Link>
            <Link href="/gallery" className="btn btn-light">
              Explore the Farm
            </Link>
          </div>
          <div className="animate-fade delay-4 mt-8 flex items-center justify-center gap-2 text-sm text-white/80">
            <span className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} className="fill-brass-soft text-brass-soft" />)}</span>
            100% couple-recommended on The Knot &amp; WeddingWire
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="h-12 w-6 rounded-full border border-white/40 p-1.5">
            <div className="mx-auto h-2 w-1 animate-bounce rounded-full bg-white/80" />
          </div>
        </div>
      </section>

      {/* ============ STAT BAR ============ */}
      <section className="border-b border-ink/10 bg-parchment">
        <div className="container-x grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="text-center">
              <p className="font-display text-4xl text-ink md:text-5xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ WELCOME ============ */}
      <section className="bg-bone py-24 md:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Welcome to the farm</p>
            <h2 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              One place for every moment —
              <span className="font-script text-brass"> and the whole weekend to enjoy it.</span>
            </h2>
            <p className="mt-6 leading-relaxed text-ink-soft">
              We took a historic 1893 fruit farm and reimagined it for the way modern
              celebrations should feel: unhurried, all in one place, and unmistakably yours.
              Rehearse on Friday, marry beneath the heritage orchard on Saturday, and linger
              over brunch on Sunday — with your closest people staying right here the whole time.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {amenities.slice(0, 6).map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-ink-soft">
                  <Check size={17} className="mt-0.5 shrink-0 text-sage" /> {a}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn btn-ghost mt-9">Our Story <ArrowRight size={16} /></Link>
          </Reveal>

          <Reveal delay={150} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
              <Image src={gallery[0]} alt="Couple beneath the orchard" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-[color:var(--color-ink)] p-6 text-parchment shadow-xl sm:block">
              <p className="font-script text-3xl text-brass-soft">Est. 1893</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-parchment/60">A living, growing legacy</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SPACES ============ */}
      <section className="bg-[color:var(--color-linen)] py-24 md:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The spaces</p>
            <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">Four settings, one seamless day</h2>
            <p className="mt-4 text-ink-soft">Every space flows into the next — no shuttles, no logistics, no rushing.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {spaces.map((sp, i) => (
              <Reveal key={sp.slug} delay={(i % 2) * 120}>
                <article className="card-hover group h-full overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={sp.image} alt={sp.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw, 50vw" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-widest text-ink">{sp.tag}</span>
                  </div>
                  <div className="p-7">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-3xl text-ink">{sp.name}</h3>
                      <span className="text-xs uppercase tracking-wider text-sage-deep">{sp.capacity}</span>
                    </div>
                    <p className="mt-3 leading-relaxed text-ink-soft">{sp.detail}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE WEEKEND ============ */}
      <section className="relative overflow-hidden bg-[color:var(--color-ink)] py-24 text-parchment md:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow !text-brass-soft">The signature weekend</p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">44 hours that belong to you</h2>
            <p className="mt-4 text-parchment/70">Friday 3PM to Sunday 11AM — the entire farm, exclusively yours.</p>
          </Reveal>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {weekend.map((w, i) => (
              <Reveal key={w.day} delay={i * 120} className="relative">
                <div className="flex items-center gap-3 text-brass-soft">
                  <Clock size={18} />
                  <span className="text-xs uppercase tracking-[0.2em]">{w.day} · {w.time}</span>
                </div>
                <h3 className="mt-4 font-display text-3xl">{w.title}</h3>
                <p className="mt-3 leading-relaxed text-parchment/70">{w.body}</p>
                {i < weekend.length - 1 && <div className="mt-8 hidden h-px bg-gradient-to-r from-brass/50 to-transparent md:block" />}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PLANNING TOOLS ============ */}
      <section className="bg-bone py-24 md:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Planning, reimagined</p>
            <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">A smarter way to plan your wedding</h2>
            <p className="mt-4 text-ink-soft">Tools you won&apos;t find at any other venue — designed to make the whole journey feel effortless.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wand2, title: "Design My Day", body: "See your wedding in your exact colors with our AI design studio — mood boards in seconds.", href: "/design-my-day", cta: "Visualize it" },
              { icon: CalendarCheck, title: "Instant Availability", body: "Check your date and get real-time pricing and a golden-hour ceremony time — no waiting.", href: "/pricing", cta: "Check your date" },
              { icon: Handshake, title: "Your Dream Team", body: "Our AI matchmaker assembles a vetted vendor team proven right here at the farm.", href: "/vendors", cta: "Meet the vendors" },
              { icon: MessageCircle, title: "Rosie, 24/7", body: "Our AI concierge answers questions, checks dates, and helps you plan any hour of the day.", href: "/contact", cta: "Say hello" },
            ].map((t, i) => (
              <Reveal key={t.title} delay={(i % 4) * 90}>
                <Link href={t.href} className="card-hover group flex h-full flex-col rounded-2xl bg-parchment p-7 shadow-[var(--shadow-soft)]">
                  <div className="grid h-13 w-13 place-items-center rounded-full bg-sage/12 p-3 text-sage-deep transition group-hover:bg-brass/15 group-hover:text-brass">
                    <t.icon size={24} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-ink">{t.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{t.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brass">
                    {t.cta} <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALLERY PREVIEW ============ */}
      <section className="bg-bone py-24 md:py-32">
        <div className="container-x">
          <Reveal className="flex flex-col items-end justify-between gap-4 sm:flex-row">
            <div>
              <p className="eyebrow">A glimpse</p>
              <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">Moments made here</h2>
            </div>
            <Link href="/gallery" className="link-underline text-sm font-medium uppercase tracking-widest text-ink">View full gallery →</Link>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.slice(0, 8).map((src, i) => (
              <Reveal key={src} delay={(i % 4) * 80} className={i % 5 === 0 ? "row-span-2" : ""}>
                <div className={`relative overflow-hidden rounded-xl ${i % 5 === 0 ? "aspect-[3/4] md:h-full" : "aspect-square"}`}>
                  <Image src={src} alt="The Farm 1893 gallery" fill className="object-cover transition-transform duration-700 hover:scale-110" sizes="(max-width:768px) 50vw, 25vw" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-[color:var(--color-sage-deep)] py-24 text-parchment md:py-32">
        <div className="container-x">
          <Reveal className="text-center">
            <Quote className="mx-auto text-brass-soft" size={40} />
            <p className="eyebrow mt-4 !text-brass-soft">Loved by our couples</p>
          </Reveal>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <figure className="flex h-full flex-col rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur">
                  <div className="flex text-brass-soft">{Array.from({ length: 5 }).map((_, s) => <Star key={s} size={15} className="fill-current" />)}</div>
                  <blockquote className="mt-4 flex-1 font-display text-xl leading-relaxed text-parchment/90">“{t.quote}”</blockquote>
                  <figcaption className="mt-6">
                    <p className="font-script text-2xl text-brass-soft">{t.name}</p>
                    <p className="text-xs uppercase tracking-widest text-parchment/50">{t.detail}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PACKAGES PREVIEW ============ */}
      <section className="bg-bone py-24 md:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">The investment</p>
            <h2 className="mt-4 font-display text-4xl text-ink md:text-5xl">Choose your celebration</h2>
            <p className="mt-4 text-ink-soft">Transparent packages, no surprises. Every one is all-in-one.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {packages.map((p, i) => (
              <Reveal key={p.name} delay={i * 110}>
                <div className={`card-hover flex h-full flex-col rounded-2xl p-8 ${p.featured ? "bg-[color:var(--color-ink)] text-parchment shadow-[var(--shadow-lift)] ring-2 ring-brass" : "bg-parchment text-ink shadow-[var(--shadow-soft)]"}`}>
                  {p.featured && <span className="mb-4 inline-block w-fit rounded-full bg-brass px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-widest text-ink">Most popular</span>}
                  <h3 className="font-display text-3xl">{p.name}</h3>
                  <p className={`mt-1 text-sm ${p.featured ? "text-parchment/60" : "text-stone"}`}>{p.summary}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-display text-4xl">{p.price}</span>
                    <span className={`text-xs ${p.featured ? "text-parchment/60" : "text-stone"}`}>{p.cadence}</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.slice(0, 6).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm">
                        <Check size={16} className={`mt-0.5 shrink-0 ${p.featured ? "text-brass-soft" : "text-sage"}`} /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/pricing" className={`btn mt-7 ${p.featured ? "bg-parchment text-ink" : "btn-ghost"}`}>See details</Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LEAD MAGNET ============ */}
      <section className="bg-[color:var(--color-linen)] py-20 md:py-24">
        <div className="container-x max-w-4xl">
          <Reveal><GuideCapture /></Reveal>
        </div>
      </section>

      {/* ============ AVAILABILITY CTA ============ */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <Image src={gallery[4]} alt="" fill className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[color:var(--color-ink)]/70" />
        <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="text-parchment">
            <Sparkles className="text-brass-soft" />
            <h2 className="mt-4 font-display text-4xl md:text-5xl">Your date could still be open</h2>
            <p className="mt-4 max-w-md text-parchment/75">
              Peak Saturdays book 12–18 months out. Check yours in seconds — then let's
              plan a private tour so you can feel the magic in person.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <DateChecker />
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
