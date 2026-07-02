import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { Reveal } from "@/components/site/Reveal";
import { LeadForm } from "@/components/site/LeadForm";
import { business } from "@/lib/content";

export const metadata = { title: "Book a Tour" };

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;

  return (
    <SiteShell>
      <section className="bg-[color:var(--color-ink)] pt-36 pb-24 text-parchment">
        <div className="container-x grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="eyebrow !text-brass-soft">Let's begin</p>
            <p className="mt-2 font-script text-4xl text-brass-soft">say hello</p>
            <h1 className="mt-2 font-display text-5xl leading-tight md:text-6xl">Plan your visit to the farm</h1>
            <p className="mt-5 max-w-md leading-relaxed text-parchment/75">
              Tell us a little about your celebration and we'll be in touch quickly — often
              within the hour. Prefer to talk now? Our AI concierge is online 24/7, or call us anytime.
            </p>

            <div className="mt-10 space-y-5">
              <a href={business.phoneHref} className="flex items-center gap-4 group">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 group-hover:bg-white/20"><Phone size={20} className="text-brass-soft" /></span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-parchment/50">Call or text</span>
                  <span className="text-lg">{business.phone}</span>
                </span>
              </a>
              <a href={`mailto:${business.email}`} className="flex items-center gap-4 group">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 group-hover:bg-white/20"><Mail size={20} className="text-brass-soft" /></span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-parchment/50">Email</span>
                  <span className="text-lg">{business.email}</span>
                </span>
              </a>
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><MapPin size={20} className="text-brass-soft" /></span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-parchment/50">Visit</span>
                  <span className="text-lg">{business.address}</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><Clock size={20} className="text-brass-soft" /></span>
                <span>
                  <span className="block text-xs uppercase tracking-widest text-parchment/50">Tours</span>
                  <span className="text-lg">By appointment · 7 days a week</span>
                </span>
              </div>
            </div>

            <div className="mt-10 flex items-center gap-3 rounded-xl bg-brass/10 p-4 ring-1 ring-brass/30">
              <MessageCircle size={22} className="shrink-0 text-brass-soft" />
              <p className="text-sm text-parchment/80">
                <span className="font-medium text-parchment">Rosie, our AI concierge,</span> can answer questions and check dates instantly — look for the chat button in the corner.
              </p>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <LeadForm defaultDate={date ?? ""} />
          </Reveal>
        </div>
      </section>

      <section className="bg-bone">
        <div className="h-80 w-full bg-[color:var(--color-linen)]">
          <iframe
            title="The Farm 1893 location"
            className="h-full w-full grayscale-[0.3]"
            loading="lazy"
            src="https://www.google.com/maps?q=Berlin+Heights+Ohio&output=embed"
          />
        </div>
      </section>
    </SiteShell>
  );
}
