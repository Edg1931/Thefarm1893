import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/guard";
import { getLeads, getEvents, getVendors, getSiloGuests } from "@/lib/crm/data";
import type { Lead, BookingEvent, VendorRecord } from "@/lib/crm/sample-data";
import type { SiloGuest } from "@/lib/silos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SearchHit = { kind: string; label: string; detail: string; href: string };

/**
 * Backs the topbar search box, which until now was a text input wired to
 * nothing. Searches the records an owner actually looks people up by — a
 * couple's name, an email, a vendor — and returns a link to the page that
 * record lives on.
 */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  if (q.length < 2) return NextResponse.json({ hits: [] });

  const [{ leads }, { events }, { vendors }, { guests }] = await Promise.all([
    getLeads(), getEvents(), getVendors(), getSiloGuests(),
  ]);
  const has = (...vals: (string | number | null | undefined)[]) =>
    vals.some((v) => v != null && String(v).toLowerCase().includes(q));

  const hits: SearchHit[] = [
    ...leads.filter((l: Lead) => has(l.name, l.email, l.phone, l.eventType)).map((l: Lead) => ({
      kind: "Lead", label: l.name,
      detail: [l.stage, l.eventType, l.eventDate].filter(Boolean).join(" · "),
      href: "/dashboard/leads",
    })),
    ...events.filter((e: BookingEvent) => has(e.title, e.type)).map((e: BookingEvent) => ({
      kind: "Booking", label: e.title, detail: `${e.status} · ${e.date}`, href: "/dashboard/bookings",
    })),
    ...vendors.filter((v: VendorRecord) => has(v.name, v.category)).map((v: VendorRecord) => ({
      kind: "Vendor", label: v.name, detail: `${v.category} · ${v.tier}`, href: "/dashboard/vendors",
    })),
    ...guests.filter((g: SiloGuest) => has(g.name, g.email, g.silo)).map((g: SiloGuest) => ({
      kind: "Silo stay", label: g.name, detail: `${g.silo} · ${g.checkIn}`, href: "/dashboard/rentals",
    })),
  ];

  return NextResponse.json({ hits: hits.slice(0, 12) });
}
