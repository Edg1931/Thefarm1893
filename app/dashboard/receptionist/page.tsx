import { ReceptionistTester, ReceptionistConfig } from "@/components/crm/ReceptionistConsole";
import { StatCard, Panel } from "@/components/crm/widgets";
import { PhoneCall, MessageSquare, CalendarCheck, Clock } from "lucide-react";

export const metadata = { title: "AI Receptionist" };

const callLog = [
  { name: "Jordan Blake", channel: "Web chat", intent: "Checked May 30 availability", outcome: "Lead captured", time: "9 min ago", hot: true },
  { name: "Unknown caller", channel: "Phone", intent: "Pricing for 120-guest wedding", outcome: "Brochure emailed", time: "1 hr ago", hot: false },
  { name: "Priya Raman", channel: "Web chat", intent: "Booked a tour for Jul 8", outcome: "Tour scheduled", time: "3 hrs ago", hot: true },
  { name: "Kevin M.", channel: "Phone", intent: "Asked about pet-friendly ceremonies", outcome: "Answered · follow-up", time: "Yesterday", hot: false },
];

export default function ReceptionistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">AI Receptionist</h1>
        <p className="mt-1 text-stone">Rosie answers every inquiry — web or phone — 24/7, and drops qualified leads straight into your pipeline.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Conversations (30d)" value="312" delta="+40%" icon={MessageSquare} accent="ink" />
        <StatCard label="Calls answered" value="128" delta="24/7" icon={PhoneCall} accent="brass" />
        <StatCard label="Tours booked by AI" value="19" delta="+7" icon={CalendarCheck} accent="sage" />
        <StatCard label="Avg. answer time" value="0.8 s" delta="Instant" icon={Clock} accent="terracotta" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ReceptionistTester />
        <ReceptionistConfig />
      </div>

      <Panel title="Recent conversations" action={<span className="text-sm text-stone">Auto-logged to CRM</span>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-stone">
              <tr className="border-b border-ink/8">
                <th className="pb-3 font-medium">Caller</th>
                <th className="pb-3 font-medium">Channel</th>
                <th className="pb-3 font-medium">Intent</th>
                <th className="pb-3 font-medium">Outcome</th>
                <th className="pb-3 font-medium">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {callLog.map((c, i) => (
                <tr key={i} className="hover:bg-bone/60">
                  <td className="py-3 font-medium text-ink">
                    {c.hot && <span className="mr-1">🔥</span>}{c.name}
                  </td>
                  <td className="py-3"><span className="rounded-full bg-bone px-2.5 py-1 text-xs text-ink-soft">{c.channel}</span></td>
                  <td className="py-3 text-ink-soft">{c.intent}</td>
                  <td className="py-3 text-sage-deep">{c.outcome}</td>
                  <td className="py-3 text-stone">{c.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
