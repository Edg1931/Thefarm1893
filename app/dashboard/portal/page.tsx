import Link from "next/link";
import { ExternalLink, MessageCircle, FileText, Users } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { PortalInbox } from "@/components/crm/PortalInbox";
import { PortalLinkButton } from "@/components/crm/PortalLinkButton";
import { getPortalData } from "@/lib/crm/data";
import { DEMO_LEAD_ID } from "@/lib/crm/portal";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Client Portal" };

export default async function DashboardPortalPage() {
  const leadId = DEMO_LEAD_ID;
  const { live, identity, messages, documents, rsvps } = await getPortalData(leadId, "hannah-and-wes");
  const yes = rsvps.filter((r) => r.status === "attending").reduce((s, r) => s + r.partySize, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-ink">Client Portal</h1>
          <p className="mt-1 text-stone">What your couples see — and where you reply to them.</p>
        </div>
        {identity && (
          <div className="flex flex-wrap gap-2">
            <PortalLinkButton leadId={leadId} />
            <Link href={`/portal/${leadId}`} target="_blank" className="btn btn-ghost !py-2 !text-xs">
              Open {identity.coupleName}&apos;s portal <ExternalLink size={13} />
            </Link>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Panel title="RSVPs in"><p className="font-display text-3xl text-ink">{yes}</p><p className="text-xs text-stone">guests attending</p></Panel>
        <Panel title="Documents shared"><p className="font-display text-3xl text-ink">{documents.length}</p><p className="text-xs text-stone">in the vault</p></Panel>
        <Panel title="Event date"><p className="font-display text-2xl text-ink">{identity ? formatDate(identity.eventDate) : "—"}</p><p className="text-xs text-stone">{identity?.package}</p></Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={<span className="flex items-center gap-2"><MessageCircle size={16} className="text-brass" /> Reply to {identity?.coupleName ?? "client"}</span>}>
          <div className="h-[360px]">
            <PortalInbox
              leadId={leadId} initial={messages} as="staff" live={live}
              context={identity ? { clientName: identity.coupleName, eventDate: identity.eventDate, packageName: identity.package, balanceDue: identity.balanceDue } : undefined}
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title={<span className="flex items-center gap-2"><FileText size={16} className="text-brass" /> Documents</span>}>
            <ul className="space-y-2">
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded-xl bg-bone p-3 text-sm">
                  <span className="truncate text-ink">{d.name}</span>
                  <span className="shrink-0 text-xs capitalize text-stone">{d.kind}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title={<span className="flex items-center gap-2"><Users size={16} className="text-brass" /> Guest RSVPs</span>}>
            <ul className="space-y-2">
              {rsvps.map((r) => (
                <li key={r.id} className="flex items-center justify-between rounded-xl bg-bone p-3 text-sm">
                  <span className="text-ink">{r.guestName} <span className="text-xs text-stone">· party of {r.partySize}</span></span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${r.status === "attending" ? "bg-sage/15 text-sage-deep" : r.status === "declined" ? "bg-ink/8 text-stone" : "bg-brass/15 text-brass"}`}>{r.status}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
