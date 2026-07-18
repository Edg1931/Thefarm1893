import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBudget } from "@/lib/crm/lodging";
import { getCelebration, PRIVACY_SECTIONS } from "@/lib/celebrations";
import { WeddingCostPlanner } from "@/components/WeddingCostPlanner";
import { PrivacySettings } from "@/components/site/PrivacySettings";
import { Logo } from "@/components/site/Logo";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const b = getBudget(slug);
  return { title: b ? `${b.coupleName} · Cost Planner` : "Cost Planner" };
}

export default async function PlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const budget = getBudget(slug);
  if (!budget) notFound();
  const celebration = getCelebration(slug);

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-ink/10 bg-parchment">
        <div className="container-x flex items-center justify-between py-4">
          <Logo />
          <Link href={`/celebration/${slug}`} className="text-sm text-stone hover:text-ink">Guest site →</Link>
        </div>
      </header>

      <main className="container-x py-12 md:py-16">
        <p className="font-script text-3xl text-brass">plan together, save together</p>
        <h1 className="mt-1 font-display text-5xl text-ink">Your Wedding Cost Planner</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          {budget.coupleName} · {formatDate(budget.eventDate)}. See your full wedding cost live. Assign each
          room and silo to a guest couple, cover it yourself, or add it to your registry — and watch your total drop.
        </p>

        <div className="mt-10">
          <WeddingCostPlanner items={budget.items} rooms={budget.rooms} coupleName={budget.coupleName} />
        </div>

        {celebration && (
          <div className="mt-10 max-w-xl">
            <PrivacySettings slug={slug} accessCode={celebration.accessCode} sections={PRIVACY_SECTIONS} initial={celebration.privacy} />
          </div>
        )}

        <div className="mt-10 flex items-center gap-2 text-sm text-stone">
          <ArrowLeft size={14} /> This is your private planning link — safe to bookmark and share room links with guests.
        </div>
      </main>
    </div>
  );
}
