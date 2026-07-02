import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, CalendarDays, Users, Package, DollarSign,
  ExternalLink, Sun, Check, Clock, CircleAlert, Sparkles, StickyNote, UserCog,
} from "lucide-react";
import { getDossier } from "@/lib/crm/bookings";
import { getBudget, summarize } from "@/lib/crm/lodging";
import { Panel, PriorityBadge } from "@/components/crm/widgets";
import { goldenHourPlan } from "@/lib/services/golden-hour";
import { formatCurrency, formatDate } from "@/lib/utils";

const vendorStatus: Record<string, { cls: string; label: string; Icon: typeof Check }> = {
  confirmed: { cls: "text-sage-deep bg-sage/12", label: "Confirmed", Icon: Check },
  pending: { cls: "text-brass bg-brass/12", label: "Pending", Icon: Clock },
  needed: { cls: "text-terracotta bg-terracotta/10", label: "Needed", Icon: CircleAlert },
};

export default async function ClientDossier({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getDossier(id);
  if (!data) notFound();
  const { lead, dossier } = data;

  const gh = goldenHourPlan(lead.eventDate);
  const budget = dossier.micrositeSlug ? getBudget(dossier.micrositeSlug) : null;
  const lodging = budget ? summarize(budget.items, budget.rooms) : null;
  const paid = dossier.payments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
  const balance = dossier.contractValue - paid;
  const done = dossier.checklist.filter((c) => c.done).length;
  const pct = Math.round((done / dossier.checklist.length) * 100);

  return (
    <div className="space-y-6">
      <Link href="/dashboard/contacts" className="inline-flex items-center gap-2 text-sm text-stone hover:text-ink">
        <ArrowLeft size={15} /> Back to contacts
      </Link>

      {/* Header */}
      <div className="rounded-2xl bg-[color:var(--color-ink)] p-7 text-parchment shadow-[var(--shadow-soft)]">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brass/20 font-display text-2xl text-brass-soft ring-1 ring-brass/40">
              {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <h1 className="font-display text-4xl">{lead.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-parchment/70">
                <span>{lead.eventType}</span>
                <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatDate(lead.eventDate)}</span>
                <span className="flex items-center gap-1.5"><Users size={14} /> {lead.guestCount} guests</span>
                <PriorityBadge priority={lead.stage === "booked" ? "booked" : lead.priority} />
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${lead.email}`} className="btn btn-light !py-2.5 !text-xs"><Mail size={14} /> Email</a>
            <a href={`tel:${lead.phone}`} className="btn btn-light !py-2.5 !text-xs"><Phone size={14} /> Call</a>
            {dossier.micrositeSlug ? (
              <Link href={`/celebration/${dossier.micrositeSlug}`} target="_blank" className="btn bg-parchment text-ink !py-2.5 !text-xs">
                <ExternalLink size={14} /> View Guest Microsite
              </Link>
            ) : (
              <button className="btn bg-brass text-ink !py-2.5 !text-xs"><Sparkles size={14} /> Generate Guest Microsite</button>
            )}
          </div>
        </div>
      </div>

      {/* Quick facts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Fact icon={Package} label="Package" value={dossier.package} />
        <Fact icon={DollarSign} label="Contract value" value={formatCurrency(dossier.contractValue)} />
        <Fact icon={UserCog} label="Coordinator" value={dossier.coordinator} />
        <Fact icon={Sun} label="Suggested ceremony" value={gh ? gh.ceremonyStart : "—"} sub={gh ? `Sunset ${gh.sunset}` : undefined} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Vendor team */}
        <Panel title="Vendor team" className="xl:col-span-2"
          action={<span className="text-xs text-stone">{dossier.vendors.filter((v) => v.name).length}/{dossier.vendors.length} filled</span>}>
          <div className="grid gap-3 sm:grid-cols-2">
            {dossier.vendors.map((v) => {
              const s = vendorStatus[v.status];
              return (
                <div key={v.role} className="flex items-center justify-between rounded-xl bg-bone p-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone">{v.role}</p>
                    {v.name ? (
                      <>
                        <p className="truncate font-medium text-ink">{v.name}</p>
                        {v.contact && <p className="truncate text-xs text-stone">{v.contact}</p>}
                      </>
                    ) : (
                      <p className="text-sm italic text-terracotta">Not booked yet</p>
                    )}
                  </div>
                  <span className={`ml-3 flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] font-medium ${s.cls}`}>
                    <s.Icon size={12} /> {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <Link href="/dashboard/vendors" className="mt-4 inline-block text-sm text-brass hover:underline">Manage vendor network →</Link>
        </Panel>

        {/* Payments + progress */}
        <div className="space-y-6">
          <Panel title="Payments">
            <div className="space-y-2.5">
              {dossier.payments.map((p) => (
                <div key={p.label} className="flex items-center justify-between rounded-lg bg-bone px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{p.label}</p>
                    <p className="text-xs text-stone">Due {formatDate(p.due)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-ink">{formatCurrency(p.amount)}</p>
                    <span className={`text-[0.68rem] font-medium ${p.paid ? "text-sage-deep" : "text-terracotta"}`}>{p.paid ? "Paid" : "Due"}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-ink/8 pt-4 text-sm">
              <div className="flex justify-between text-stone"><span>Paid to date</span><span className="font-medium text-sage-deep">{formatCurrency(paid)}</span></div>
              <div className="flex justify-between text-stone"><span>Balance</span><span className="font-medium text-ink">{formatCurrency(balance)}</span></div>
            </div>
          </Panel>

          <Panel title="Planning progress" action={<span className="text-sm font-medium text-ink">{pct}%</span>}>
            <div className="h-2 overflow-hidden rounded-full bg-linen">
              <div className="h-full rounded-full bg-gradient-to-r from-sage-deep to-sage" style={{ width: `${pct}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {dossier.checklist.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  <span className={`grid h-5 w-5 place-items-center rounded-full ${c.done ? "bg-sage text-parchment" : "border border-ink/20"}`}>
                    {c.done && <Check size={12} />}
                  </span>
                  <span className={c.done ? "text-stone line-through" : "text-ink-soft"}>{c.label}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Lodging cost split */}
      {budget && lodging && (
        <Panel title="Lodging & cost split"
          action={<Link href={`/plan/${budget.slug}`} target="_blank" className="btn btn-ghost !py-2 !px-4 !text-xs">Open Cost Planner ↗</Link>}>
          <div className="grid gap-4 sm:grid-cols-4">
            <SplitStat label="Full wedding cost" value={formatCurrency(lodging.fullTotal)} />
            <SplitStat label="Couple's total" value={formatCurrency(lodging.coupleTotal)} accent="ink" />
            <SplitStat label="Delegated to guests" value={formatCurrency(lodging.delegated)} accent="sage" />
            <SplitStat label="Paid by guests" value={formatCurrency(lodging.guestPaid)} accent="brass" />
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-stone">
                <tr className="border-b border-ink/8"><th className="pb-2 font-medium">Room</th><th className="pb-2 font-medium">Covered by</th><th className="pb-2 font-medium">Price</th><th className="pb-2 font-medium">Payment</th></tr>
              </thead>
              <tbody className="divide-y divide-ink/6">
                {budget.rooms.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2.5 font-medium text-ink">{r.name}</td>
                    <td className="py-2.5 text-ink-soft">{r.coveredBy === "guest" ? (r.guestName ?? "A guest") : `${lead.name.split(" ")[0]} (couple)`}</td>
                    <td className="py-2.5 text-ink-soft">{formatCurrency(r.price)}</td>
                    <td className="py-2.5">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.paid ? "bg-sage/15 text-sage-deep" : r.coveredBy === "guest" ? "bg-brass/15 text-brass" : "bg-ink/8 text-ink-soft"}`}>
                        {r.paid ? "Paid" : r.coveredBy === "guest" ? "Awaiting payment" : "On couple's tab"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {/* Notes */}
      <Panel title="Notes & AI summary">
        <div className="flex gap-3 rounded-xl bg-brass/8 p-4">
          <StickyNote size={18} className="mt-0.5 shrink-0 text-brass" />
          <p className="text-sm leading-relaxed text-ink-soft">{dossier.notes}</p>
        </div>
      </Panel>
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
