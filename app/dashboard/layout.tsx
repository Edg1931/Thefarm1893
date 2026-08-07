import { Sidebar } from "@/components/crm/Sidebar";
import { AccountMenu } from "@/components/crm/AccountMenu";
import { SyncErrorToast } from "@/components/crm/SyncErrorToast";
import { getProperties } from "@/lib/crm/data";
import { NotificationBell } from "@/components/crm/NotificationBell";
import { GlobalSearch } from "@/components/crm/GlobalSearch";

export const metadata = { title: "Venue OS — Dashboard" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { properties } = await getProperties();
  // Column on mobile so the Sidebar's mobile top-bar stacks ABOVE the content;
  // a flex row from lg up where the desktop sidebar sits alongside it. (As a
  // row at every width, the mobile bar became a sibling column and squeezed the
  // dashboard to ~220px on a phone.)
  return (
    <div className="min-h-screen bg-[color:var(--color-linen)] lg:flex">
      <Sidebar properties={properties} />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-ink/10 bg-parchment/90 px-8 py-4 backdrop-blur lg:flex">
          <GlobalSearch />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <AccountMenu />
          </div>
        </header>
        <div className="flex-1 p-5 md:p-8">{children}</div>
      </div>
      <SyncErrorToast />
    </div>
  );
}
