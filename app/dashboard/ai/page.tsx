import Link from "next/link";
import {
  FileText, Megaphone, Zap, Bot, Sparkles, ArrowRight,
  PenLine, CalendarClock, MessageSquareText, Wand2,
} from "lucide-react";
import { Panel, InsightCard } from "@/components/crm/widgets";
import { aiInsights } from "@/lib/crm/sample-data";

export const metadata = { title: "AI Center — Venue OS" };

const TOOLS = [
  {
    href: "/dashboard/proposals",
    icon: FileText,
    accent: "brass",
    name: "AI Proposals",
    role: "Writes the quote",
    blurb:
      "Turns a lead's date, guest count, and budget into a branded proposal with packages, pricing, and a personal note — draft in seconds, you edit and send.",
    stat: "Avg. 6 min saved per proposal",
  },
  {
    href: "/dashboard/marketing",
    icon: Megaphone,
    accent: "terracotta",
    name: "AI Marketing Studio",
    role: "Fills the calendar",
    blurb:
      "Generates on-brand social posts, emails, flyers, and ad copy by audience persona — with a rich editor, emojis, and one-click scheduling across every channel.",
    stat: "All channels · 20+ templates",
  },
  {
    href: "/dashboard/automations",
    icon: Zap,
    accent: "sage",
    name: "AI Automations",
    role: "Never drops a lead",
    blurb:
      "Instant lead replies, tour reminders, review requests, and slow-week 'fill-the-date' campaigns — the follow-ups that run whether or not you're at the desk.",
    stat: "Sub-5-minute reply time",
  },
  {
    href: "/dashboard/receptionist",
    icon: Bot,
    accent: "ink",
    name: "AI Receptionist (Rosie)",
    role: "Answers first",
    blurb:
      "Greets every website visitor and caller, answers venue questions, checks open dates, and books tours straight into your calendar — 24/7, in your voice.",
    stat: "Captures leads after hours",
  },
] as const;

const FLOW = [
  { icon: MessageSquareText, label: "Rosie greets & captures the lead" },
  { icon: Wand2, label: "AI scores & drafts the first reply" },
  { icon: FileText, label: "AI builds the proposal" },
  { icon: CalendarClock, label: "Automations nurture to booked" },
  { icon: PenLine, label: "Marketing fills the empty dates" },
] as const;

const accentBg: Record<string, string> = {
  brass: "bg-brass/12 text-brass",
  terracotta: "bg-terracotta/12 text-terracotta",
  sage: "bg-sage/15 text-sage-deep",
  ink: "bg-ink/8 text-ink",
};

export default function AICenterPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brass">
          <Sparkles size={14} /> AI Center
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">Everything AI, in one place</h1>
        <p className="mt-2 max-w-2xl text-stone">
          Your venue's AI works across the whole journey — from the first hello to a booked weekend and
          the marketing that keeps the calendar full. Here's each part and exactly what it does for you.
        </p>
      </div>

      {/* The journey */}
      <Panel title="How your AI works together" className="bg-gradient-to-br from-ink to-[#2a2620] !text-parchment">
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
          {FLOW.map((s, i) => (
            <div key={s.label} className="flex flex-1 items-center gap-3">
              <div className="flex flex-1 flex-col items-center gap-2 rounded-xl bg-white/5 p-4 text-center ring-1 ring-white/10">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brass/20 text-brass-soft">
                  <s.icon size={18} />
                </span>
                <span className="text-xs leading-snug text-parchment/80">{s.label}</span>
              </div>
              {i < FLOW.length - 1 && <ArrowRight size={16} className="hidden shrink-0 text-parchment/30 md:block" />}
            </div>
          ))}
        </div>
      </Panel>

      {/* Tools */}
      <div className="grid gap-5 md:grid-cols-2">
        {TOOLS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)] ring-1 ring-ink/5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${accentBg[t.accent]}`}>
                <t.icon size={22} />
              </span>
              <span className="rounded-full bg-bone px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide text-stone">
                {t.role}
              </span>
            </div>
            <h3 className="mt-4 font-display text-2xl text-ink">{t.name}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{t.blurb}</p>
            <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-4">
              <span className="text-xs font-medium text-sage-deep">{t.stat}</span>
              <span className="flex items-center gap-1 text-sm font-medium text-brass group-hover:underline">
                Open <ArrowRight size={15} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Live insights */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">What AI is flagging right now</h2>
          <Link href="/dashboard/analytics" className="text-sm font-medium text-brass hover:underline">
            See all insights →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {aiInsights.map((ins) => (
            <InsightCard key={ins.title} icon={ins.icon} tone={ins.tone} title={ins.title} body={ins.body} />
          ))}
        </div>
      </div>
    </div>
  );
}
