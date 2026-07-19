import { ContactsManager } from "@/components/crm/ContactsManager";
import { getLeads } from "@/lib/crm/data";

export const metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const { leads, live } = await getLeads();
  return <ContactsManager initial={leads} live={live} />;
}
