"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Loader2, Sparkles, Printer, Send } from "lucide-react";
import type { Lead } from "@/lib/crm/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";

type ProposalLine = { item: string; detail: string; amount: number };
type Proposal = {
  lead: string; headline: string; note: string; packageName: string;
  lines: ProposalLine[]; subtotal: number; deposit: number; validUntil: string; mocked: boolean;
};

export function ProposalStudio({ leads, live }: { leads: Lead[]; live: boolean }) {
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [proposal, setProposal] = useState<Proposal | null>(null);

  async function generate() {
    setLoading(true);
    setProposal(null);
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      setProposal(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const lead = leads.find((l) => l.id === leadId);

  if (!lead) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl text-ink">AI Proposals</h1>
          <p className="mt-1 text-stone">Turn any lead into a personalized, itemized proposal in one click.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-ink/15 bg-bone p-10 text-center">
          <FileText className="mx-auto text-brass" size={26} />
          <p className="mt-3 font-display text-xl text-ink">No leads yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone">
            Proposals are built from a real inquiry. As soon as your first lead comes in, you can generate one here.
          </p>
          <Link href="/dashboard/leads" className="btn btn-ghost mt-5 !py-2 !text-xs">Open the pipeline</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">AI Proposals</h1>
        <p className="mt-1 text-stone">Turn any lead into a personalized, itemized proposal in one click.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Controls */}
        <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)] lg:sticky lg:top-28 lg:self-start">
          <label className="text-xs font-medium uppercase tracking-wider text-stone">Choose a lead</label>
          <select value={leadId} onChange={(e) => setLeadId(e.target.value)}
            className="mt-2 w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage">
            {leads.map((l) => <option key={l.id} value={l.id}>{l.name} · {l.eventType}</option>)}
          </select>

          <div className="mt-4 rounded-xl bg-bone p-4 text-sm">
            <p className="text-ink-soft"><span className="text-stone">Date:</span> {formatDate(lead.eventDate)}</p>
            <p className="text-ink-soft"><span className="text-stone">Guests:</span> {lead.guestCount}</p>
            <p className="text-ink-soft"><span className="text-stone">Est. budget:</span> {formatCurrency(lead.budget)}</p>
          </div>

          <button onClick={generate} disabled={loading} className="btn btn-primary mt-5 w-full disabled:opacity-60">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate Proposal
          </button>
        </div>

        {/* Preview */}
        <div>
          {!proposal && !loading && (
            <div className="grid h-full min-h-[400px] place-items-center rounded-2xl border border-dashed border-ink/20 bg-parchment/50 p-10 text-center">
              <div><FileText className="mx-auto text-brass" size={36} /><p className="mt-4 font-display text-2xl text-ink">Your proposal will appear here</p><p className="mt-1 text-sm text-stone">Personalized note, recommended package, and itemized estimate.</p></div>
            </div>
          )}
          {loading && (
            <div className="grid h-full min-h-[400px] place-items-center rounded-2xl bg-parchment/50"><div className="text-center"><Loader2 className="mx-auto animate-spin text-brass" size={32} /><p className="mt-3 font-script text-2xl text-brass">Writing your proposal…</p></div></div>
          )}
          {proposal && (
            <div className="animate-rise overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-lift)]">
              <div className="bg-[color:var(--color-ink)] px-8 py-7 text-parchment">
                <p className="font-script text-2xl text-brass-soft">The Farm 1893</p>
                <h2 className="mt-1 font-display text-3xl">{proposal.headline}</h2>
                <p className="mt-1 text-sm text-parchment/60">Prepared for {proposal.lead} · Valid until {formatDate(proposal.validUntil)}</p>
              </div>
              <div className="px-8 py-7">
                <p className="rounded-xl bg-bone p-5 leading-relaxed text-ink-soft">{proposal.note}</p>
                <div className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-stone">Recommended · {proposal.packageName}</p>
                  <table className="mt-3 w-full text-sm">
                    <tbody className="divide-y divide-ink/8">
                      {proposal.lines.map((l, i) => (
                        <tr key={i}>
                          <td className="py-3"><p className="font-medium text-ink">{l.item}</p><p className="text-xs text-stone">{l.detail}</p></td>
                          <td className="py-3 text-right font-medium text-ink">{l.amount === 0 ? <span className="text-sage-deep">Included</span> : formatCurrency(l.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-ink/10"><td className="pt-3 font-display text-xl text-ink">Estimated total</td><td className="pt-3 text-right font-display text-xl text-ink">{formatCurrency(proposal.subtotal)}</td></tr>
                      <tr><td className="py-1 text-sm text-stone">Deposit to reserve (25%)</td><td className="py-1 text-right text-sm font-medium text-brass">{formatCurrency(proposal.deposit)}</td></tr>
                    </tfoot>
                  </table>
                </div>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button onClick={() => window.print()} className="btn btn-ghost flex-1"><Printer size={16} /> Print / Save PDF</button>
                  <button
                    onClick={() => {
                      const to = lead.email;
                      const subject = `Your proposal from The Farm 1893`;
                      const body = `Hi ${proposal.lead.split(" ")[0]},\n\n${proposal.note}\n\nEstimated total: ${formatCurrency(proposal.subtotal)}\nDeposit to reserve: ${formatCurrency(proposal.deposit)}\nValid until ${proposal.validUntil}\n\n— The Farm 1893`;
                      window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                    disabled={!lead.email}
                    title={lead.email ? `Email ${lead.email}` : "This lead has no email address"}
                    className="btn btn-primary flex-1 disabled:opacity-50"
                  ><Send size={16} /> Send to {proposal.lead.split(" ")[0]}</button>
                </div>
                {proposal.mocked && <p className="mt-3 text-center text-xs text-stone">Demo mode · add ANTHROPIC_API_KEY for fully AI-written notes.</p>}
                {!live && <p className="mt-1 text-center text-xs text-stone">Sample leads shown — real inquiries appear here once the database is connected.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
