import { SiteShell } from "@/components/site/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { StyleQuiz } from "@/components/site/StyleQuiz";

// Hero images come from Supabase Storage (heroes/<page>.jpg). Without this
// the hero is baked at build time, so a newly uploaded photo would never
// appear until the next deploy.
export const revalidate = 60;

export const metadata = {
  title: "What's Your Wedding Style?",
  description: "Take our 60-second quiz and discover your wedding style + color palette at The Farm 1893.",
};

export default function QuizPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="60-second quiz"
        script="let's find your look"
        title="What's your wedding style?"
        subtitle="Answer five quick questions and we'll design your palette, mood board, and vision — instantly."
        heroKey="quiz"
        image="https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?auto=format&fit=crop&w=2100&q=80"
      />
      <section className="bg-bone py-16 md:py-24">
        <div className="container-x">
          <Reveal><StyleQuiz /></Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
