import { ContactsManager } from "@/components/crm/ContactsManager";
import { getLeads } from "@/lib/crm/data";
import { leads as sampleLeads } from "@/lib/crm/sample-data";

export const metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const { leads, live } = await getLeads();
  // In live mode, surface a couple of fully-detailed example clients to click into.
  const examples = live ? sampleLeads.filter((l) => l.id === "L-1042" || l.id === "L-1039") : [];
  return <ContactsManager initial={leads} live={live} examples={examples} />;
}
