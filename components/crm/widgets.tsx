import { TrendingUp, AlertTriangle, Sparkles, Star, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/* --- Stat card --- */
export function StatCard({
  label, value, delta, icon: Icon, accent = "sage",
}: {
  label: string; value: string; delta?: string; icon: LucideIcon; accent?: "sage" | "brass" | "terracotta" | "ink";
}) {
  const ring = {
    sage: "text-sage-deep bg-sage/12",
    brass: "text-brass bg-brass/12",
    terracotta: "text-terracotta bg-terracotta/12",
    ink: "text-ink bg-ink/8",
  }[accent];
  return (
    <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between">
        <span className={cn("grid h-11 w-11 place-items-center rounded-xl", ring)}><Icon size={20} /></span>
        {delta && <span className="rounded-full bg-sage/12 px-2.5 py-1 text-xs font-medium text-sage-deep">{delta}</span>}
      </div>
      <p className="mt-4 font-display text-4xl text-ink">{value}</p>
      <p className="mt-1 text-sm text-stone">{label}</p>
    </div>
  );
}

/* --- AI insight card --- */
const insightIcons: Record<string, LucideIcon> = {
  trend: TrendingUp, alert: AlertTriangle, sparkle: Sparkles, star: Star,
};
const toneMap: Record<string, string> = {
  sage: "border-sage/30 bg-sage/8 text-sage-deep",
  terracotta: "border-terracotta/30 bg-terracotta/8 text-terracotta",
  brass: "border-brass/30 bg-brass/8 text-brass",
  ink: "border-ink/15 bg-ink/5 text-ink",
};
export function InsightCard({
  icon, tone, title, body, cta,
}: {
  icon: string; tone: string; title: string; body: string; cta?: string;
}) {
  const Icon = insightIcons[icon] ?? Sparkles;
  return (
    <div className={cn("rounded-2xl border p-5", toneMap[tone] ?? toneMap.ink)}>
      <div className="flex items-center gap-2">
        <Icon size={18} />
        <span className="text-[0.7rem] font-semibold uppercase tracking-widest">AI Insight</span>
      </div>
      <h4 className="mt-3 font-display text-xl text-ink">{title}</h4>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{body}</p>
      <button className="mt-4 text-sm font-medium text-ink underline-offset-4 hover:underline">
        {cta ?? "Take action"} →
      </button>
    </div>
  );
}

/* --- Priority badge --- */
export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    hot: "bg-terracotta/15 text-terracotta",
    warm: "bg-brass/15 text-brass",
    nurture: "bg-sage/15 text-sage-deep",
    booked: "bg-sage-deep text-parchment",
  };
  const label: Record<string, string> = { hot: "🔥 Hot", warm: "Warm", nurture: "Nurture", booked: "Booked" };
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", map[priority] ?? map.nurture)}>
      {label[priority] ?? priority}
    </span>
  );
}

/* --- Score ring --- */
export function ScoreRing({ score }: { score: number }) {
  const color = score >= 78 ? "var(--color-terracotta)" : score >= 55 ? "var(--color-brass)" : "var(--color-sage)";
  const r = 16, c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-11 w-11 place-items-center">
      <svg width="44" height="44" className="-rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgba(28,26,23,0.1)" strokeWidth="3.5" />
        <circle cx="22" cy="22" r={r} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} />
      </svg>
      <span className="absolute text-xs font-semibold text-ink">{score}</span>
    </div>
  );
}

/* --- Simple SVG bar chart --- */
export function RevenueChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex h-56 items-end gap-2">
      {data.map((d) => (
        <div key={d.month} className="group flex flex-1 flex-col items-center gap-2">
          <div className="relative flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-sage-deep to-sage transition-all duration-500 group-hover:from-brass group-hover:to-brass-soft"
              style={{ height: `${(d.value / max) * 100}%` }}
            >
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-ink px-1.5 py-0.5 text-[0.6rem] text-parchment opacity-0 transition group-hover:opacity-100">
                ${d.value}k
              </span>
            </div>
          </div>
          <span className="text-[0.65rem] text-stone">{d.month}</span>
        </div>
      ))}
    </div>
  );
}

/* --- Section card wrapper --- */
export function Panel({
  title, action, children, className,
}: {
  title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]", className)}>
      {title && (
        <header className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl text-ink">{title}</h3>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
