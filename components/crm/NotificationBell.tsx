"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, DoorOpen, Wallet, ClipboardList, Loader2 } from "lucide-react";

type Item = { kind: string; title: string; detail: string; date: string; amount?: number };

const ICON: Record<string, typeof Bell> = {
  event: CalendarDays, arrival: DoorOpen, departure: DoorOpen, balance: Wallet, task: ClipboardList,
};
const HREF: Record<string, string> = {
  event: "/dashboard/bookings", arrival: "/dashboard/rentals", departure: "/dashboard/turnover",
  balance: "/dashboard/payments", task: "/dashboard/operations",
};

/**
 * The topbar bell used to be a static icon with a permanent red dot — it
 * claimed there was something to look at and then did nothing when clicked,
 * which is worse than having no bell. It now opens the same feed the Today
 * panel uses (events, arrivals, turnovers, balances due, low stock, overdue
 * tasks), and the dot only appears when something is genuinely waiting.
 */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Load once on mount so the badge count is right before it's ever opened.
  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    fetch("/api/today")
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setItems(d.items ?? []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setBusy(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const count = items?.length ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={count ? `Notifications, ${count} waiting` : "Notifications"}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-bone text-ink-soft transition hover:bg-linen"
      >
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-terracotta px-1 text-[0.6rem] font-semibold text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-ink/10 bg-parchment shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
            <p className="font-medium text-ink">Needs attention</p>
            {busy && <Loader2 size={14} className="animate-spin text-stone" />}
          </div>

          {count === 0 && !busy && (
            <p className="px-4 py-8 text-center text-sm text-stone">Nothing needs you right now.</p>
          )}

          <ul className="max-h-96 overflow-y-auto">
            {(items ?? []).slice(0, 12).map((it, i) => {
              const Icon = ICON[it.kind] ?? ClipboardList;
              return (
                <li key={i}>
                  <Link
                    href={HREF[it.kind] ?? "/dashboard"}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 transition hover:bg-bone"
                  >
                    <Icon size={15} className="mt-0.5 shrink-0 text-brass" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">{it.title}</span>
                      <span className="block truncate text-xs text-stone">{it.detail} · {it.date}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {count > 0 && (
            <Link href="/dashboard" onClick={() => setOpen(false)}
              className="block border-t border-ink/8 px-4 py-3 text-center text-sm font-medium text-brass hover:bg-bone">
              Open the day at a glance
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
