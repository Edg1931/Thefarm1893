import { Panel, StatCard } from "@/components/crm/widgets";
import { AutomationBuilder } from "@/components/crm/AutomationBuilder";
import { sequences } from "@/lib/crm/growth";
import { getAutomations } from "@/lib/crm/data";
import { Zap, Mail, MessageSquare, Users, CheckCircle2 } from "lucide-react";

export const metadata = { title: "AI Automations" };

export default async function AutomationsPage() {
  const totalEnrolled = sequences.reduce((s, q) => s + q.enrolled, 0);
  const totalBooked = sequences.reduce((s, q) => s + q.booked, 0);
  const active = sequences.filter((s) => s.status === "active").length;
  const { automations, live } = await getAutomations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">AI Automations</h1>
        <p className="mt-1 text-stone">Every lead nurtured automatically — email &amp; text, drafted by AI, sent at the perfect time.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Active sequences" value={String(active)} icon={Zap} accent="brass" />
        <StatCard label="Contacts enrolled" value={totalEnrolled.toLocaleString()} icon={Users} accent="ink" />
        <StatCard label="Booked from nurture" value={String(totalBooked)} delta="+7 this mo" icon={CheckCircle2} accent="sage" />
      </div>

      {/* Live rule engine: trigger → action, toggle on/off, add your own */}
      <AutomationBuilder initial={automations} live={live} />

      <div className="rounded-2xl border border-brass/25 bg-brass/8 p-5 text-sm text-ink-soft">
        <span className="font-medium text-ink">AI Copilot:</span> Leads contacted within 5 minutes convert 3× more often — your
        Welcome sequence now fires instantly and has booked 41 weddings. Turn on the paused <b>Slow-Week Filler</b> to
        auto-market your 4 open dates in the next 60 days.
      </div>

      <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
        {sequences.map((seq) => (
          <Panel key={seq.id}
            title={seq.name}
            action={<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${seq.status === "active" ? "bg-sage/15 text-sage-deep" : "bg-ink/8 text-ink-soft"}`}>{seq.status === "active" ? "● Active" : "Paused"}</span>}>
            <p className="-mt-2 text-xs text-stone">Trigger: {seq.trigger}</p>
            <div className="mt-4 space-y-2.5">
              {seq.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-bone p-3">
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${step.channel === "Email" ? "bg-sage/15 text-sage-deep" : "bg-brass/15 text-brass"}`}>
                    {step.channel === "Email" ? <Mail size={15} /> : <MessageSquare size={15} />}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-stone">{step.channel} · {step.delay}</p>
                    <p className="truncate text-sm text-ink">{step.subject}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 border-t border-ink/8 pt-3 text-sm">
              <span className="text-stone">Enrolled <b className="text-ink">{seq.enrolled}</b></span>
              <span className="text-stone">Booked <b className="text-sage-deep">{seq.booked}</b></span>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
