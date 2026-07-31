import { Sparkles, CheckCircle2, Circle, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

/**
 * AI planning timeline — a date-aware, prioritized checklist generated from the
 * couple's event date, package, and outstanding balance. Deterministic (same
 * "smart mock" pattern as the rest of Venue OS), so it works with no API key
 * yet reads like a proactive planner nudging on-time payments and tasks.
 */
type Milestone = { offset: number; title: string; detail: string };

const MILESTONES: Milestone[] = [
  { offset: 180, title: "Contract signed & deposit paid", detail: "Your date is locked in." },
  { offset: 120, title: "Finalize your guest list", detail: "Send save-the-dates so travel plans can start." },
  { offset: 90, title: "Choose your menu & confirm vendors", detail: "We'll share our preferred-vendor picks for your style." },
  { offset: 60, title: "Send invitations", detail: "RSVPs flow straight into your portal and seating chart." },
  { offset: 30, title: "Final headcount & seating chart", detail: "Lock numbers so catering and layout are perfect." },
  { offset: 14, title: "Confirm day-of timeline", detail: "Review the schedule and upload any vendor COIs." },
  { offset: 7, title: "Rehearsal & final walkthrough", detail: "We'll walk the grounds together and set the stage." },
];

export function PlanningTimeline({ eventDate, balanceDue, coupleName }: { eventDate: string; balanceDue: number; coupleName: string }) {
  const event = new Date(eventDate + "T00:00:00");
  if (Number.isNaN(event.getTime())) return null;
  const daysOut = Math.round((event.getTime() - Date.now()) / 86_400_000);

  const headline =
    daysOut < 0 ? `Congratulations, ${coupleName}! 🌾`
    : daysOut === 0 ? "It's today — enjoy every moment! 💛"
    : daysOut <= 14 ? `The big day is ${daysOut} day${daysOut === 1 ? "" : "s"} away — let's finalize the details.`
    : `You're ${daysOut} days out. Here's what AI recommends focusing on next.`;

  // The next not-yet-due milestone is the current focus.
  const withDates = MILESTONES.map((m) => {
    const due = new Date(event); due.setDate(due.getDate() - m.offset);
    return { ...m, due, done: due.getTime() < Date.now() };
  });
  const focusIdx = withDates.findIndex((m) => !m.done);

  return (
    <section className="rounded-2xl border border-ink/8 bg-parchment p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brass/15"><Sparkles size={16} className="text-brass" /></span>
        <div>
          <h2 className="font-display text-2xl text-ink">Your AI planning timeline</h2>
          <p className="text-sm text-stone">{headline}</p>
        </div>
      </div>

      {balanceDue > 0 && daysOut >= 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-brass/10 px-4 py-2.5 text-sm text-ink ring-1 ring-brass/25">
          <AlertTriangle size={15} className="text-brass" /> Balance of <b>{formatCurrency(balanceDue)}</b> is outstanding — settle it from the card above to stay on track.
        </div>
      )}

      <ol className="mt-5 space-y-3">
        {withDates.map((m, i) => {
          const isFocus = i === focusIdx;
          return (
            <li key={m.title} className={`flex items-start gap-3 rounded-xl p-3 ${isFocus ? "bg-sage/10 ring-1 ring-sage/25" : ""}`}>
              <span className="mt-0.5 shrink-0">
                {m.done ? <CheckCircle2 size={18} className="text-sage-deep" /> : isFocus ? <Sparkles size={18} className="text-brass" /> : <Circle size={18} className="text-stone/50" />}
              </span>
              <div className="min-w-0">
                <p className={`text-sm ${m.done ? "text-stone line-through" : "font-medium text-ink"}`}>{m.title}{isFocus && <span className="ml-2 rounded-full bg-brass/15 px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-wide text-brass">Up next</span>}</p>
                <p className="text-xs text-stone">{m.detail} · target {formatDate(m.due.toISOString().slice(0, 10))}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
