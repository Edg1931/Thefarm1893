import { CalendarHeart, LogIn, LogOut, DollarSign, ListChecks, Sparkles } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import type { TodayItem } from "@/lib/crm/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const meta: Record<TodayItem["kind"], { icon: typeof CalendarHeart; tint: string; label: string }> = {
  event: { icon: CalendarHeart, tint: "bg-sage-deep text-parchment", label: "Event" },
  arrival: { icon: LogIn, tint: "bg-brass text-ink", label: "Arrival" },
  departure: { icon: LogOut, tint: "bg-terracotta text-parchment", label: "Turnover" },
  balance: { icon: DollarSign, tint: "bg-ink text-parchment", label: "Balance due" },
  task: { icon: ListChecks, tint: "bg-sage text-parchment", label: "Task" },
};

/** The owner's command-center list: what's happening in the next two weeks. */
export function TodayPanel({ items }: { items: TodayItem[] }) {
  const shown = items.slice(0, 8);
  return (
    <Panel
      title="Today & the days ahead"
      action={<span className="text-sm text-stone">Next 14 days</span>}
    >
      {shown.length === 0 ? (
        <div className="rounded-xl bg-sage/10 p-4 text-sm text-sage-deep">
          <Sparkles size={15} className="mb-1 inline text-sage-deep" /> Nothing on the calendar in the next two weeks — a good window to fill an open Saturday.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {shown.map((it, i) => {
            const m = meta[it.kind];
            const Icon = m.icon;
            return (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-bone p-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${m.tint}`}><Icon size={16} /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{it.title}</p>
                  <p className="truncate text-xs text-stone">{formatDate(it.date)} · {it.detail}</p>
                </div>
                {it.amount != null ? (
                  <span className="shrink-0 font-display text-sm text-ink">{formatCurrency(it.amount)}</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-parchment px-2 py-0.5 text-[0.62rem] font-medium text-ink-soft">{m.label}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
