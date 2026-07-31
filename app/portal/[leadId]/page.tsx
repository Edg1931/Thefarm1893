import { notFound } from "next/navigation";
import { CalendarHeart, FileText, MessageCircle, Armchair, Wallet, Download } from "lucide-react";
import { PortalShell } from "@/components/site/PortalShell";
import { PortalInbox } from "@/components/crm/PortalInbox";
import { SeatingChart } from "@/components/crm/SeatingChart";
import { DocumentUpload } from "@/components/site/DocumentUpload";
import { PayButton } from "@/components/site/PayButton";
import { PlanningTimeline } from "@/components/site/PlanningTimeline";
import { PortalAccessNotice } from "@/components/site/PortalAccessNotice";
import { resolvePortalAccess } from "@/lib/services/portal-access";
import { getPortalData } from "@/lib/crm/data";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata = { title: "Your Planning Portal", robots: { index: false } };

export default async function PortalPage({ params, searchParams }: {
  params: Promise<{ leadId: string }>;
  searchParams: Promise<{ w?: string; t?: string }>;
}) {
  const { leadId } = await params;
  const { w, t } = await searchParams;

  // Private data — the visitor must hold a signed link for this booking, or be
  // signed in and bound to it. Open only in demo mode.
  const access = await resolvePortalAccess(leadId, t);
  if (!access.ok) return <PortalAccessNotice reason={access.reason} />;

  const { live, identity, messages, documents, seating, rsvps } = await getPortalData(leadId, w ?? "hannah-and-wes");
  if (!identity) notFound();
  const attendingCount = rsvps.filter((r) => r.status !== "declined").length;

  return (
    <PortalShell title={identity.coupleName} subtitle={`${identity.package} · ${formatDate(identity.eventDate)}`}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: balance + documents */}
        <div className="space-y-6">
          {/* Balance / payments */}
          <section className="rounded-2xl bg-ink p-6 text-parchment">
            <p className="flex items-center gap-2 text-sm text-brass-soft"><Wallet size={16} /> Your balance</p>
            <p className="mt-2 font-display text-4xl">{formatCurrency(identity.balanceDue)}</p>
            <p className="mt-1 text-sm text-parchment/60">of {formatCurrency(identity.totalValue)} total · {identity.package}</p>
            {identity.balanceDue > 0 && (
              <div className="mt-4">
                <PayButton amount={Math.min(identity.balanceDue, identity.totalValue)} description={`${identity.coupleName} — balance`} kind="balance" label="Make a payment" className="btn bg-parchment text-ink" />
              </div>
            )}
          </section>

          {/* Documents */}
          <section className="rounded-2xl border border-ink/8 bg-parchment p-6">
            <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><FileText size={18} className="text-brass" /> Documents</h2>
            <ul className="mt-4 space-y-2">
              {documents.length === 0 && <li className="text-sm text-stone">No documents yet.</li>}
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl bg-bone p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                    <p className="text-xs text-stone capitalize">{d.kind} · {d.uploadedBy}</p>
                  </div>
                  <a href={d.url} className="shrink-0 text-stone hover:text-brass" aria-label={`Download ${d.name}`}><Download size={16} /></a>
                </li>
              ))}
            </ul>
            <div className="mt-4"><DocumentUpload leadId={leadId} /></div>
          </section>
        </div>

        {/* Middle: messaging */}
        <section className="flex min-h-[420px] flex-col rounded-2xl border border-ink/8 bg-parchment p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl text-ink"><MessageCircle size={18} className="text-brass" /> Messages with the Farm</h2>
          <div className="flex-1"><PortalInbox leadId={leadId} initial={messages} as="couple" live={live} /></div>
        </section>
      </div>

      {/* AI planning timeline — date-aware next-best-actions */}
      <div className="mt-6">
        <PlanningTimeline eventDate={identity.eventDate} balanceDue={identity.balanceDue} coupleName={identity.coupleName} />
      </div>

      {/* Seating chart */}
      <section className="mt-6 rounded-2xl border border-ink/8 bg-parchment p-6">
        <div className="mb-2 flex items-center gap-2">
          <Armchair size={18} className="text-brass" />
          <h2 className="font-display text-2xl text-ink">Seating chart</h2>
        </div>
        <p className="mb-5 text-sm text-stone">Drawn from your RSVP list — {attendingCount} guest{attendingCount === 1 ? "" : "s"} responding yes.</p>
        <SeatingChart leadId={leadId} initial={seating} rsvps={rsvps} live={live} />
      </section>

      {/* Timeline nudge */}
      <section className="mt-6 flex items-center gap-3 rounded-2xl bg-sage/10 p-5 text-sage-deep">
        <CalendarHeart size={20} />
        <p className="text-sm">Your full weekend timeline lives on your guest site. Questions about the schedule? Just message us above.</p>
      </section>
    </PortalShell>
  );
}
