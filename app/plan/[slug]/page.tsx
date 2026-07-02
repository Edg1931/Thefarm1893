import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBudget } from "@/lib/crm/lodging";
import { WeddingCostPlanner } from "@/components/WeddingCostPlanner";
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
          {budget.coupleName} · {formatDate(budget.eventDate)}. See your full wedding cost live, and
          delegate any overnight room to a guest to bring your total down.
        </p>

        <div className="mt-10">
          <WeddingCostPlanner items={budget.items} rooms={budget.rooms} coupleName={budget.coupleName} />
        </div>

        <div className="mt-10 flex items-center gap-2 text-sm text-stone">
          <ArrowLeft size={14} /> This is your private planning link — safe to bookmark and share room links with guests.
        </div>
      </main>
    </div>
  );
}
