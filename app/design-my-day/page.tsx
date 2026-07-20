import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { DesignStudio } from "@/components/site/DesignStudio";

export const metadata = {
  title: "Design My Day",
  description: "Visualize your wedding at The Farm 1893 with our AI design studio.",
};

export default function DesignMyDayPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="AI Design Studio"
        script="see it before you book it"
        title="Design My Day"
        subtitle="The first venue design studio of its kind — craft a mood board and a vision for your wedding at the farm in seconds."
        heroKey="design-my-day"
        image="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=2100&q=80"
      />
      <section className="bg-bone py-16 md:py-24">
        <div className="container-x">
          <Reveal><DesignStudio /></Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
