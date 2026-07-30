import { UnifiedInbox } from "@/components/crm/UnifiedInbox";
import { getConversations } from "@/lib/crm/data";

export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const { conversations } = await getConversations();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink">Unified Inbox</h1>
        <p className="mt-1 text-stone">Email, SMS, web chat, Airbnb, and VRBO — one thread list, one reply box, with Rosie ready to draft.</p>
      </div>
      <UnifiedInbox initial={conversations} />
    </div>
  );
}
