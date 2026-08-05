import Link from "next/link";
import { Database, Sparkles } from "lucide-react";

/**
 * One consistent way to say "this is sample data" (or "you're live and empty").
 *
 * The CRM previously had three different treatments for the same message — a
 * full bordered banner on two pages, a tiny grey caption on nine components,
 * and nothing at all on eleven others. This is the single pattern, modelled on
 * the three-way branch the leads page already got right.
 */
export function DemoBanner({
  live,
  empty = false,
  what,
  emptyMessage,
}: {
  /** Is the page reading real database rows? */
  live: boolean;
  /** Live, but nothing in the table yet — the day-one case. */
  empty?: boolean;
  /** What this page shows, e.g. "reviews" or "your inbox". */
  what: string;
  /** Optional custom copy for the live-and-empty state. */
  emptyMessage?: string;
}) {
  if (live && !empty) return null;

  if (live && empty) {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl border border-sage/30 bg-sage/8 p-4 text-sm text-sage-deep">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <p>{emptyMessage ?? `You're live — ${what} will appear here as they come in.`}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-brass/25 bg-brass/8 p-4 text-sm text-ink-soft">
      <Database size={16} className="mt-0.5 shrink-0 text-brass" />
      <p>
        <span className="font-medium text-ink">Sample data.</span>{" "}
        {`Connect the database and real ${what} appear here automatically — `}
        <Link href="/dashboard/settings" className="font-medium text-brass hover:underline">check your connection</Link>.
      </p>
    </div>
  );
}
