"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import {
  LayoutDashboard, Users, KanbanSquare, CalendarDays, Megaphone,
  Bot, Settings, Menu, X, Sparkles, Handshake, FileText,
  BarChart3, Zap, FileSignature, Share2, Home, LogOut, Layers, CreditCard,
} from "lucide-react";
import { business } from "@/lib/content";

type NavLink = { href: string; label: string; icon: typeof LayoutDashboard };
type NavSection = { heading?: string; links: NavLink[] };

const sections: NavSection[] = [
  {
    links: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    heading: "Clients & Bookings",
    links: [
      { href: "/dashboard/leads", label: "Lead Pipeline", icon: KanbanSquare },
      { href: "/dashboard/bookings", label: "Bookings & Calendar", icon: CalendarDays },
      { href: "/dashboard/rentals", label: "Silo Stays · VRBO", icon: Home },
      { href: "/dashboard/contacts", label: "Contacts", icon: Users },
      { href: "/dashboard/contracts", label: "Contracts & Deposits", icon: FileSignature },
      { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    heading: "AI Center",
    links: [
      { href: "/dashboard/ai", label: "AI Center", icon: Sparkles },
      { href: "/dashboard/proposals", label: "AI Proposals", icon: FileText },
      { href: "/dashboard/marketing", label: "Marketing Studio", icon: Megaphone },
      { href: "/dashboard/content", label: "Content Library", icon: Layers },
      { href: "/dashboard/automations", label: "Automations", icon: Zap },
      { href: "/dashboard/receptionist", label: "AI Receptionist", icon: Bot },
    ],
  },
  {
    heading: "Growth",
    links: [
      { href: "/dashboard/vendors", label: "Vendor Network", icon: Handshake },
      { href: "/dashboard/referrals", label: "Referrals", icon: Share2 },
    ],
  },
  {
    links: [{ href: "/dashboard/settings", label: "Integrations", icon: Settings }],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const Nav = (
    <nav className="flex flex-col gap-4">
      {sections.map((section, i) => (
        <div key={section.heading ?? `sec-${i}`} className="flex flex-col gap-1">
          {section.heading && (
            <p className="px-4 pb-1 pt-1 text-[0.6rem] font-semibold uppercase tracking-[0.15em] text-parchment/35">
              {section.heading}
            </p>
          )}
          {section.links.map((l) => {
            const active =
              l.href === "/dashboard" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition ${
                  active
                    ? "bg-brass/15 font-medium text-parchment ring-1 ring-brass/30"
                    : "text-parchment/60 hover:bg-white/5 hover:text-parchment"
                }`}
              >
                <l.icon size={18} className={active ? "text-brass-soft" : ""} />
                {l.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile bar */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[color:var(--color-ink)] px-4 py-3 text-parchment lg:hidden">
        <span className="font-display text-xl">The Farm 1893</span>
        <button onClick={() => setOpen(true)} aria-label="Menu"><Menu /></button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 flex-col bg-[color:var(--color-ink)] p-5 lg:flex">
        <SidebarHeader />
        <div className="mt-8 flex-1 overflow-y-auto pr-1">{Nav}</div>
        <UpgradeCard />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-[color:var(--color-ink)] p-5">
            <div className="flex items-center justify-between">
              <SidebarHeader />
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="text-parchment" /></button>
            </div>
            <div className="mt-8 flex-1 overflow-y-auto pr-1">{Nav}</div>
          </aside>
        </div>
      )}
    </>
  );
}

function SidebarHeader() {
  return (
    <div>
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-brass/20 ring-1 ring-brass/40">
          <Sparkles size={18} className="text-brass-soft" />
        </div>
        <div className="leading-none">
          <p className="font-display text-lg text-parchment">{business.name}</p>
          <p className="text-[0.65rem] uppercase tracking-widest text-parchment/40">Venue OS</p>
        </div>
      </Link>
    </div>
  );
}

function UpgradeCard() {
  return (
    <div className="mt-6 rounded-xl bg-gradient-to-br from-brass/20 to-sage/10 p-4 ring-1 ring-brass/20">
      <p className="text-sm font-medium text-parchment">AI Copilot active</p>
      <p className="mt-1 text-xs text-parchment/60">Insights refresh in real time as leads and bookings change.</p>
      <div className="mt-3 flex items-center justify-between">
        <Link href="/" className="text-xs font-medium text-brass-soft hover:underline">← Back to website</Link>
        <SignOut />
      </div>
    </div>
  );
}

function SignOut() {
  const router = useRouter();
  if (!supabaseConfigured()) return null;
  async function signOut() {
    try { await createClient().auth.signOut(); } catch { /* ignore */ }
    router.push("/login");
    router.refresh();
  }
  return (
    <button onClick={signOut} className="flex items-center gap-1 text-xs text-parchment/60 hover:text-parchment">
      <LogOut size={13} /> Sign out
    </button>
  );
}
