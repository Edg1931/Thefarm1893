import { Gift, Heart, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { ReferForm } from "@/components/site/ReferForm";

export const metadata = {
  title: "Refer a Friend",
  description: "Loved your day at The Farm 1893? Refer a couple and enjoy a free anniversary night on us.",
};

const steps = [
  { icon: Heart, title: "Refer a couple", body: "Share the farm with an engaged friend using the form below." },
  { icon: Sparkles, title: "They fall in love", body: "We'll give them a warm welcome and a private tour." },
  { icon: Gift, title: "You both win", body: "If they book, enjoy a free anniversary night in the farmhouse." },
];

export default function ReferPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Ambassador Program"
        script="share the love"
        title="Refer a friend, stay the night"
        subtitle="Our happiest couples send us their favorite people — and we say thank you with a night back at the farm."
        image="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=2100&q=80"
      />

      <section className="bg-bone py-20 md:py-24">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="h-full rounded-2xl bg-parchment p-8 text-center shadow-[var(--shadow-soft)]">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brass/12 text-brass"><s.icon size={24} /></div>
                  <h3 className="mt-4 font-display text-2xl text-ink">{s.title}</h3>
                  <p className="mt-2 text-sm text-ink-soft">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-xl">
            <Reveal>
              <h2 className="text-center font-display text-3xl text-ink">Send a referral</h2>
              <div className="mt-6"><ReferForm /></div>
            </Reveal>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
