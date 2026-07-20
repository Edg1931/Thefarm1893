import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Package, DollarSign, Sun, UserCog,
} from "lucide-react";
import { getDossier, dossierForLead } from "@/lib/crm/bookings";
import { getLeadById, getStoredDossier, liveConfigured } from "@/lib/crm/data";
import { getBudget, summarize } from "@/lib/crm/lodging";
import { getRegistry, summarizeRegistry } from "@/lib/crm/registry";
import { vendorRecords } from "@/lib/crm/sample-data";
import { Panel } from "@/components/crm/widgets";
import { DossierHeader, EditableNotes } from "@/components/crm/DossierEdit";
import { DossierHub } from "@/components/crm/DossierHub";
import { DossierDetails } from "@/components/crm/DossierDetails";
import { goldenHourPlan } from "@/lib/services/golden-hour";
import { formatCurrency } from "@/lib/utils";

export default async function ClientDossier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data = getDossier(id);
  if (!data) {
    // Live DB lead (UUID) that isn't in the sample set — build its dossier.
    const lead = await getLeadById(id);
    if (lead) data = { lead, dossier: dossierForLead(lead) };
  }
  if (!data) notFound();
  const { lead } = data;
  // Merge any persisted dossier edits (vendor team / payments / checklist) from the DB.
  const stored = await getStoredDossier(lead.id);
  const dossier = stored ? { ...data.dossier, ...stored } : data.dossier;
  const live = liveConfigured();

  const gh = goldenHourPlan(lead.eventDate);
  const budget = dossier.micrositeSlug ? getBudget(dossier.micrositeSlug) : null;
  const lodging = budget ? summarize(budget.items, budget.rooms) : null;
  const registry = dossier.micrositeSlug ? getRegistry(dossier.micrositeSlug) : null;
  const gifts = registry ? summarizeRegistry(registry.funds) : null;
  const vendorOptions = vendorRecords.map((v) => ({ name: v.name, category: v.category }));

  return (
    <div className="space-y-6">
      <Link href="/dashboard/contacts" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink">
        <ArrowLeft size={15} /> Back to contacts
      </Link>

      {/* Header (editable) */}
      <DossierHeader lead={lead} micrositeSlug={dossier.micrositeSlug} />

      {/* Quick facts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Fact icon={Package} label="Package" value={dossier.package} />
        <Fact icon={DollarSign} label="Contract value" value={formatCurrency(dossier.contractValue)} />
        <Fact icon={UserCog} label="Coordinator" value={dossier.coordinator} />
        <Fact icon={Sun} label="Suggested ceremony" value={gh ? gh.ceremonyStart : "—"} sub={gh ? `Sunset ${gh.sunset}` : undefined} />
      </div>

      {/* Event details & day-of logistics (editable) */}
      <DossierDetails leadId={lead.id} initial={dossier.details} live={live} />

      <DossierHub
        leadId={lead.id}
        contractValue={dossier.contractValue}
        vendors={dossier.vendors}
        payments={dossier.payments}
        checklist={dossier.checklist}
        vendorOptions={vendorOptions}
        live={live}
      />

      {/* Lodging cost split */}
      {budget && lodging && (
        <Panel title="Lodging & cost split"
          action={<Link href={`/plan/${budget.slug}`} target="_blank" className="btn btn-ghost !py-2 !px-4 !text-xs">Open Cost Planner ↗</Link>}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SplitStat label="Full wedding cost" value={formatCurrency(lodging.fullTotal)} />
            <SplitStat label="Couple's total" value={formatCurrency(lodging.coupleTotal)} accent="ink" />
            <SplitStat label="Assigned to guests" value={formatCurrency(lodging.delegated)} accent="sage" />
            <SplitStat label="On the registry" value={formatCurrency(lodging.onRegistry)} accent="brass" />
            <SplitStat label="Paid by guests" value={formatCurrency(lodging.guestPaid)} accent="brass" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr className="border-b border-ink/8"><th className="pb-2 font-medium">Unit</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Covered by</th><th className="pb-2 font-medium">Price</th><th className="pb-2 font-medium">Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {budget.rooms.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 font-medium text-ink">{r.name}</td>
                    <td className="py-2.5 text-xs text-stone">{r.type === "silo" ? "Silo" : "Farmhouse"}</td>
                    <td className="py-2.5 text-ink-soft">
                      {r.coveredBy === "guest" ? (r.guestName ?? "A guest")
                        : r.coveredBy === "registry" ? "Registry gift"
                        : `${lead.name.split(" ")[0]} (couple)`}
                    </td>
                    <td className="py-2.5 text-ink-soft">{formatCurrency(r.price)}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        r.paid ? "bg-sage/15 text-sage-deep"
                        : r.coveredBy === "guest" ? "bg-brass/15 text-brass"
                        : r.coveredBy === "registry" ? "bg-brass/15 text-brass"
                        : "bg-ink/8 text-ink-soft"}`}>
                        {r.paid ? "Paid"
                          : r.coveredBy === "guest" ? "Awaiting payment"
                          : r.coveredBy === "registry" ? "Gift-funded"
                          : "On couple's tab"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Registry */}
      {registry && gifts && (
        <Panel title="Registry & gift funds"
          action={<Link href={`/registry/${registry.slug}`} target="_blank" className="btn btn-ghost !py-2 !px-4 !text-xs">View registry ↗</Link>}>
          <div className="grid gap-4 sm:grid-cols-3">
            <SplitStat label="Total gifted" value={formatCurrency(gifts.totalGifted)} accent="brass" />
            <SplitStat label="Applied to their costs" value={formatCurrency(gifts.costOffset)} accent="sage" />
            <SplitStat label="Funds fully gifted" value={String(gifts.fullyFunded)} accent="ink" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {registry.funds.map((f) => {
              const pct = f.goal > 0 ? Math.min(100, Math.round((f.contributed / f.goal) * 100)) : null;
              return (
                <span key={f.id} className="rounded-full bg-bone px-3 py-1.5 text-xs text-ink-soft">
                  {f.title} · <span className="font-medium text-ink">{formatCurrency(f.contributed)}{pct !== null ? ` (${pct}%)` : ""}</span>
                </span>
              );
            })}
          </div>
        </Panel>
      )}

      {/* Notes (editable) */}
      <EditableNotes id={lead.id} initial={dossier.notes} />
    </div>
  );
}

function SplitStat({ label, value, accent }: { label: string; value: string; accent?: "ink" | "sage" | "brass" }) {
  const color = accent === "sage" ? "text-sage-deep" : accent === "brass" ? "text-brass" : "text-ink";
  return (
    <div className="rounded-xl bg-bone p-4">
      <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
      <p className={`mt-1 font-display text-2xl ${color}`}>{value}</p>
    </div>
  );
}

function Fact({ icon: Icon, label, value, sub }: { icon: typeof Sun; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-parchment p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-stone"><Icon size={15} /><span className="text-xs uppercase tracking-wider">{label}</span></div>
      <p className="mt-2 font-display text-2xl text-ink">{value}</p>
      {sub && <p className="text-xs text-stone">{sub}</p>}
    </div>
  );
}
