import { Panel, PriorityBadge, ScoreRing } from "@/components/crm/widgets";
import { leads } from "@/lib/crm/sample-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail, Phone, Download, Plus } from "lucide-react";

export default function ContactsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display text-4xl text-ink">Contacts</h1>
          <p className="mt-1 text-stone">Everyone who has ever inquired — enriched with AI scoring &amp; history.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost !py-2.5 !text-xs"><Download size={15} /> Export</button>
          <button className="btn btn-primary !py-2.5 !text-xs"><Plus size={15} /> New Contact</button>
        </div>
      </div>

      <Panel className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-bone text-xs uppercase tracking-wider text-stone">
              <tr>
                <th className="px-5 py-3.5 font-medium">Contact</th>
                <th className="px-5 py-3.5 font-medium">Event</th>
                <th className="px-5 py-3.5 font-medium">Value</th>
                <th className="px-5 py-3.5 font-medium">Score</th>
                <th className="px-5 py-3.5 font-medium">Status</th>
                <th className="px-5 py-3.5 font-medium">Reach out</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/6">
              {leads.map((l) => (
                <tr key={l.id} className="transition hover:bg-bone/60">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-deep/90 font-display text-sm text-parchment">
                        {l.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-ink">{l.name}</p>
                        <p className="text-xs text-stone">{l.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-ink-soft">{l.eventType}</p>
                    <p className="text-xs text-stone">{formatDate(l.eventDate)} · {l.guestCount} guests</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-ink">{formatCurrency(l.budget)}</td>
                  <td className="px-5 py-4"><ScoreRing score={l.score} /></td>
                  <td className="px-5 py-4"><PriorityBadge priority={l.stage === "booked" ? "booked" : l.priority} /></td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <a href={`mailto:${l.email}`} className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><Mail size={15} /></a>
                      <a href={`tel:${l.phone}`} className="grid h-8 w-8 place-items-center rounded-lg bg-bone text-ink-soft hover:bg-linen"><Phone size={15} /></a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
