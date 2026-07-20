/* ============================================================================
   SERVER DATA LAYER — the single door between the CRM and its data.
   - When Supabase is configured (client's DB live): reads real rows.
   - When it isn't (local/demo): returns the polished sample data so the CRM is
     fully usable in a walkthrough.
   Every getter returns `{ live }` so the UI can show the right empty states and
   skip browser-only demo persistence when the database is the source of truth.
   ============================================================================ */

import { getServiceClient } from "@/lib/supabase/server";
import {
  leads as sampleLeads,
  vendorRecords as sampleVendors,
  upcomingEvents as sampleEvents,
  type Lead,
  type Stage,
  type BookingEvent,
  type VendorRecord,
} from "./sample-data";
import { siloGuests as sampleSiloGuests, type SiloGuest } from "@/lib/silos";

export const liveConfigured = (): boolean => Boolean(getServiceClient());

/* --- helpers --- */
function relTime(iso?: string | null): string {
  if (!iso) return "just now";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

type Row = Record<string, unknown>;
const str = (v: unknown, d = "") => (v == null ? d : String(v));
const num = (v: unknown, d = 0) => {
  const n = typeof v === "string" ? parseFloat(v.replace(/[^0-9.]/g, "")) : Number(v);
  return Number.isFinite(n) ? n : d;
};

function mapLead(r: Row): Lead {
  return {
    id: str(r.id),
    name: str(r.name, "Unnamed"),
    email: str(r.email),
    phone: str(r.phone),
    eventType: str(r.event_type, "Wedding"),
    eventDate: str(r.event_date),
    guestCount: num(r.guest_count),
    budget: num(r.budget),
    stage: (str(r.stage, "new") as Stage),
    score: num(r.score, 50),
    priority: (str(r.ai_priority, "warm") as Lead["priority"]),
    source: str(r.source, "website"),
    lastActivity: relTime((r.updated_at ?? r.created_at) as string),
    aiSummary: str(r.ai_summary),
  };
}

function mapVendor(r: Row): VendorRecord {
  return {
    id: str(r.id),
    name: str(r.name),
    category: str(r.category, "Other"),
    tier: (str(r.tier, "listed") as VendorRecord["tier"]),
    status: (str(r.status, "pending") as VendorRecord["status"]),
    referralsSent: num(r.referrals_sent),
    bookedFromReferrals: num(r.booked_from_referrals),
    commissionRate: num(r.commission_rate),
    commissionEarnedYTD: num(r.commission_earned_ytd),
    rating: num(r.rating),
    membershipFee: num(r.membership_fee),
  };
}

function mapEvent(r: Row): BookingEvent | null {
  const status = str(r.status);
  const type: BookingEvent["status"] =
    status === "confirmed" || status === "completed" ? "confirmed"
    : status === "tour" ? "tour"
    : status === "cancelled" ? "confirmed" // filtered out below
    : "tentative";
  if (status === "cancelled") return null;
  const date = str(r.event_date);
  if (!date) return null;
  return { date, title: str(r.title, "Event"), type: str(r.event_type, "Wedding"), status: type };
}

function mapSiloGuest(r: Row): SiloGuest {
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    silo: str(r.silo),
    checkIn: str(r.check_in),
    nights: num(r.nights, 1),
    total: num(r.total),
    status: (str(r.status, "upcoming") as SiloGuest["status"]),
    repeat: Boolean(r.repeat),
  };
}

/* --- getters --- */
export async function getLeads(): Promise<{ live: boolean; leads: Lead[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, leads: sampleLeads };
  try {
    const { data, error } = await sb.from("leads").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return { live: true, leads: (data ?? []).map(mapLead) };
  } catch (e) {
    console.error("[data] getLeads", e);
    return { live: true, leads: [] };
  }
}

export async function getLeadById(id: string): Promise<Lead | null> {
  const sb = getServiceClient();
  if (!sb) return sampleLeads.find((l) => l.id === id) ?? null;
  try {
    const { data, error } = await sb.from("leads").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? mapLead(data) : null;
  } catch (e) {
    console.error("[data] getLeadById", e);
    return null;
  }
}

export async function getVendors(): Promise<{ live: boolean; vendors: VendorRecord[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, vendors: sampleVendors };
  try {
    const { data, error } = await sb.from("vendors").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    return { live: true, vendors: (data ?? []).map(mapVendor) };
  } catch (e) {
    console.error("[data] getVendors", e);
    return { live: true, vendors: [] };
  }
}

export async function getEvents(): Promise<{ live: boolean; events: BookingEvent[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, events: sampleEvents };
  try {
    const { data, error } = await sb.from("events").select("*").order("event_date", { ascending: true }).limit(500);
    if (error) throw error;
    const events = (data ?? []).map(mapEvent).filter((e): e is BookingEvent => e !== null);
    return { live: true, events };
  } catch (e) {
    console.error("[data] getEvents", e);
    return { live: true, events: [] };
  }
}

export async function getSiloGuests(): Promise<{ live: boolean; guests: SiloGuest[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, guests: sampleSiloGuests };
  try {
    const { data, error } = await sb.from("silo_guests").select("*").order("check_in", { ascending: false }).limit(500);
    if (error) throw error;
    return { live: true, guests: (data ?? []).map(mapSiloGuest) };
  } catch (e) {
    console.error("[data] getSiloGuests", e);
    return { live: true, guests: [] };
  }
}

/* --- Payments (Stripe checkouts logged via webhook) --- */
export type PaymentRow = { id: string; amount: number; status: string; stripeId: string | null; createdAt: string };

const samplePayments: PaymentRow[] = [
  { id: "p1", amount: 2800, status: "paid", stripeId: "cs_demo_1", createdAt: "2026-06-18T15:02:00Z" },
  { id: "p2", amount: 653, status: "paid", stripeId: "cs_demo_2", createdAt: "2026-06-22T11:20:00Z" },
  { id: "p3", amount: 4225, status: "paid", stripeId: "cs_demo_3", createdAt: "2026-07-01T09:45:00Z" },
  { id: "p4", amount: 3000, status: "paid", stripeId: "cs_demo_4", createdAt: "2026-07-08T18:30:00Z" },
  { id: "p5", amount: 857, status: "paid", stripeId: "cs_demo_5", createdAt: "2026-07-12T13:10:00Z" },
];

export async function getPayments(): Promise<{ live: boolean; payments: PaymentRow[]; collected: number }> {
  const sb = getServiceClient();
  const sum = (rows: PaymentRow[]) => rows.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  if (!sb) return { live: false, payments: samplePayments, collected: sum(samplePayments) };
  try {
    const { data, error } = await sb.from("payments").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    const payments: PaymentRow[] = (data ?? []).map((r: Row) => ({
      id: str(r.id),
      amount: num(r.amount),
      status: str(r.status, "paid"),
      stripeId: r.stripe_id ? str(r.stripe_id) : null,
      createdAt: str(r.created_at),
    }));
    return { live: true, payments, collected: sum(payments) };
  } catch (e) {
    console.error("[data] getPayments", e);
    return { live: true, payments: [], collected: 0 };
  }
}

/** Stored dossier overrides (vendor team / payments / checklist) for a client. */
export async function getStoredDossier(leadId: string): Promise<Record<string, unknown> | null> {
  const sb = getServiceClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb.from("dossiers").select("data").eq("lead_id", leadId).maybeSingle();
    if (error) throw error;
    return (data?.data as Record<string, unknown>) ?? null;
  } catch (e) {
    console.error("[data] getStoredDossier", e);
    return null;
  }
}

/** Dashboard KPIs — computed from live leads when configured, else the demo numbers. */
export async function getDashboardData() {
  const { live, leads } = await getLeads();
  if (!live) {
    const { dashboardStats } = await import("./sample-data");
    return { live, leads, stats: dashboardStats };
  }
  const open = leads.filter((l) => l.stage !== "booked" && l.stage !== "lost");
  const booked = leads.filter((l) => l.stage === "booked");
  const stats = {
    pipelineValue: open.reduce((s, l) => s + l.budget, 0),
    bookedRevenueYTD: booked.reduce((s, l) => s + l.budget, 0),
    leadsThisMonth: leads.length,
    conversionRate: leads.length ? Math.round((booked.length / leads.length) * 100) : 0,
    toursScheduled: leads.filter((l) => l.stage === "toured").length,
    avgResponseMins: 4,
  };
  return { live, leads, stats };
}
