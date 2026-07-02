import { Sidebar } from "@/components/crm/Sidebar";
import { Bell, Search } from "lucide-react";

export const metadata = { title: "Venue OS — Dashboard" };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[color:var(--color-linen)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 hidden items-center justify-between border-b border-ink/10 bg-parchment/90 px-8 py-4 backdrop-blur lg:flex">
          <div className="flex items-center gap-3 rounded-full border border-ink/10 bg-bone px-4 py-2 text-sm text-stone">
            <Search size={16} />
            <input placeholder="Search leads, events, contacts…" className="w-72 bg-transparent outline-none" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative grid h-10 w-10 place-items-center rounded-full bg-bone text-ink-soft hover:bg-linen" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-terracotta" />
            </button>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-sage-deep font-display text-lg text-parchment">F</div>
              <div className="leading-none">
                <p className="text-sm font-medium text-ink">Farm Team</p>
                <p className="text-xs text-stone">Owner</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
