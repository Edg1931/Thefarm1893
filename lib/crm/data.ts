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
import { getBlocks } from "@/lib/services/availability";
import { buildCalendar } from "./calendar";
import {
  sampleIdentities, sampleMessages, sampleDocuments, sampleSeating, sampleRsvps,
  type PortalIdentity, type PortalMessage, type PortalDocument, type SeatingTable, type Rsvp,
} from "./portal";
import {
  sampleTasks, sampleInventory, sampleMaintenance, sampleStaff, isLowStock, maintenanceDueSoon,
  type OpTask, type InventoryItem, type MaintenanceAsset, type StaffMember,
} from "./operations";

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

/* --- Unified calendar + Owner "Today" ------------------------------------- */

export type TodayItem = { kind: "event" | "arrival" | "departure" | "balance" | "task"; title: string; detail: string; date: string; amount?: number };

/**
 * The owner's at-a-glance "today + the days just ahead": upcoming events, silo
 * arrivals/departures, balances coming due, and near-term tasks. Computed from
 * live rows when configured, else from the sample data.
 */
export async function getToday(): Promise<{ live: boolean; items: TodayItem[] }> {
  const [{ live, events }, { guests }] = await Promise.all([getEvents(), getSiloGuests()]);
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const horizon = new Date(now); horizon.setDate(horizon.getDate() + 14);
  const horizonIso = horizon.toISOString().slice(0, 10);
  const within = (d: string) => d >= todayIso && d <= horizonIso;

  const items: TodayItem[] = [];

  for (const e of events) {
    if (within(e.date)) items.push({ kind: "event", title: e.title, detail: `${e.type} · ${e.status}`, date: e.date });
  }
  for (const g of guests) {
    if (within(g.checkIn)) items.push({ kind: "arrival", title: `${g.name} arrives`, detail: `${g.silo} · ${g.nights} night${g.nights > 1 ? "s" : ""}`, date: g.checkIn });
    const out = new Date(g.checkIn + "T00:00:00"); out.setDate(out.getDate() + g.nights);
    const outIso = out.toISOString().slice(0, 10);
    if (within(outIso)) items.push({ kind: "departure", title: `${g.name} checks out`, detail: `${g.silo} · turnover needed`, date: outIso });
  }

  // Balances due — live from events (contracted minus deposit), else sample billing.
  if (!live) {
    const { financials } = await import("./sample-data");
    for (const b of financials.upcomingBilling) {
      items.push({ kind: "balance", title: `${b.client} · ${b.label}`, detail: b.status, date: b.due, amount: b.amount });
    }
  } else {
    const sb = getServiceClient();
    if (sb) {
      try {
        const { data } = await sb.from("events").select("title,event_date,total_value,deposit_paid,status").in("status", ["confirmed", "tentative"]);
        for (const r of (data ?? []) as Row[]) {
          const bal = num(r.total_value) - num(r.deposit_paid);
          if (bal > 0) items.push({ kind: "balance", title: `${str(r.title, "Event")} · balance`, detail: str(r.status), date: str(r.event_date), amount: bal });
        }
      } catch (e) { console.error("[data] getToday balances", e); }
    }
  }

  // Operational tasks due within the window + low-stock / maintenance alerts.
  const { tasks } = await getOpsTasks();
  for (const t of tasks) {
    if (t.status !== "done" && within(t.dueAt)) items.push({ kind: "task", title: t.title, detail: `${t.category} · ${t.assignee}`, date: t.dueAt });
  }
  const { items: inv } = await getInventory();
  for (const i of inv) {
    if (i.quantity < i.parLevel) items.push({ kind: "task", title: `Low stock: ${i.name}`, detail: `${i.quantity}/${i.parLevel} ${i.unit} — reorder`, date: todayIso });
  }
  const { assets } = await getMaintenance();
  for (const a of assets) {
    if (a.nextService && a.nextService <= horizonIso) items.push({ kind: "task", title: `Maintenance due: ${a.name}`, detail: `${a.kind} service`, date: a.nextService < todayIso ? todayIso : a.nextService });
  }

  items.sort((a, b) => a.date.localeCompare(b.date));
  return { live, items };
}

/** The unified calendar feed (events + silo stays + blocks). */
export async function getCalendar() {
  const [{ live, events }, { guests }, { blocks }] = await Promise.all([
    getEvents(), getSiloGuests(), getBlocks(),
  ]);
  return { live, items: buildCalendar(events, guests, blocks), blocks };
}

/* --- Portals (client / guest / vendor) ------------------------------------ */

export type PortalBundle = {
  live: boolean;
  identity: PortalIdentity | null;
  messages: PortalMessage[];
  documents: PortalDocument[];
  seating: SeatingTable[];
  rsvps: Rsvp[];
};

/** Everything the couple's planning portal needs for one booking. */
export async function getPortalData(leadId: string, weddingSlug?: string): Promise<PortalBundle> {
  const sb = getServiceClient();
  if (!sb) {
    const slug = weddingSlug ?? "hannah-and-wes";
    return {
      live: false,
      identity: sampleIdentities[leadId] ?? sampleIdentities[Object.keys(sampleIdentities)[0]] ?? null,
      messages: sampleMessages[leadId] ?? [],
      documents: sampleDocuments[leadId] ?? [],
      seating: sampleSeating[leadId] ?? [],
      rsvps: sampleRsvps[slug] ?? [],
    };
  }
  try {
    const [lead, msgs, docs, tables, rsvpRows] = await Promise.all([
      sb.from("leads").select("*").eq("id", leadId).maybeSingle(),
      sb.from("portal_messages").select("*").eq("lead_id", leadId).order("created_at", { ascending: true }),
      sb.from("documents").select("*").eq("lead_id", leadId).order("created_at", { ascending: false }),
      sb.from("seating_tables").select("*, seating_assignments(guest_name)").eq("lead_id", leadId),
      weddingSlug ? sb.from("rsvps").select("*").eq("wedding_slug", weddingSlug) : Promise.resolve({ data: [] }),
    ]);
    const l = lead.data as Row | null;
    const identity: PortalIdentity | null = l
      ? {
          leadId,
          coupleName: str(l.name, "Your Celebration"),
          eventDate: str(l.event_date),
          package: str(l.event_type, "Wedding"),
          totalValue: num(l.budget),
          balanceDue: 0,
          coordinator: "The Farm 1893",
        }
      : null;
    return {
      live: true,
      identity,
      messages: (msgs.data ?? []).map((r: Row) => ({ id: str(r.id), leadId, sender: str(r.sender, "staff") as PortalMessage["sender"], body: str(r.body), createdAt: str(r.created_at) })),
      documents: (docs.data ?? []).map((r: Row) => ({ id: str(r.id), leadId, name: str(r.name), kind: str(r.kind, "other"), url: str(r.path, "#"), uploadedBy: str(r.uploaded_by, "staff") as PortalDocument["uploadedBy"], createdAt: str(r.created_at) })),
      seating: (tables.data ?? []).map((r: Row) => ({ id: str(r.id), label: str(r.label), capacity: num(r.capacity, 8), guests: ((r.seating_assignments as Row[]) ?? []).map((a) => str(a.guest_name)) })),
      rsvps: ((rsvpRows.data ?? []) as Row[]).map((r) => ({ id: str(r.id), weddingSlug: str(r.wedding_slug), guestName: str(r.guest_name), email: str(r.email), partySize: num(r.party_size, 1), meal: str(r.meal), status: str(r.status, "attending") as Rsvp["status"] })),
    };
  } catch (e) {
    console.error("[data] getPortalData", e);
    return { live: true, identity: null, messages: [], documents: [], seating: [], rsvps: [] };
  }
}

/* --- Contracts & invoices (Phase 3) --------------------------------------- */

export type ContractRow = {
  id: string; leadId: string | null; client: string; event: string; date: string;
  value: number; status: "draft" | "sent" | "signed" | "paid"; deposit: number;
  depositPaid: boolean; signedAt: string | null;
};

export async function getContracts(): Promise<{ live: boolean; contracts: ContractRow[] }> {
  const sb = getServiceClient();
  if (!sb) {
    const { contracts } = await import("./growth");
    return { live: false, contracts: contracts.map((c) => ({ id: c.id, leadId: null, client: c.client, event: c.event, date: c.date, value: c.value, status: c.status, deposit: c.deposit, depositPaid: c.depositPaid, signedAt: c.status === "signed" || c.status === "paid" ? "2026-06-20" : null })) };
  }
  try {
    const { data, error } = await sb.from("contracts").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    const contracts: ContractRow[] = (data ?? []).map((r: Row) => ({
      id: str(r.id), leadId: r.lead_id ? str(r.lead_id) : null, client: str(r.client_name, "Client"),
      event: str(r.event_type, "Event"), date: str(r.event_date), value: num(r.value),
      status: (str(r.status, "draft") as ContractRow["status"]), deposit: num(r.deposit),
      depositPaid: Boolean(r.deposit_paid), signedAt: r.signed_at ? str(r.signed_at) : null,
    }));
    return { live: true, contracts };
  } catch (e) {
    console.error("[data] getContracts", e);
    return { live: true, contracts: [] };
  }
}

export type InvoiceRow = {
  id: string; leadId: string | null; label: string; amount: number; dueDate: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void"; paidAt: string | null;
};

const sampleInvoices: InvoiceRow[] = [
  { id: "INV-1042-1", leadId: "L-1042", label: "Deposit", amount: 2800, dueDate: "2026-06-20", status: "paid", paidAt: "2026-06-20" },
  { id: "INV-1042-2", leadId: "L-1042", label: "Installment 1 of 2", amount: 6600, dueDate: "2026-08-05", status: "sent", paidAt: null },
  { id: "INV-1042-3", leadId: "L-1042", label: "Final balance", amount: 4225, dueDate: "2026-09-05", status: "draft", paidAt: null },
  { id: "INV-1041-1", leadId: "L-1041", label: "Deposit", amount: 7750, dueDate: "2026-07-28", status: "overdue", paidAt: null },
];

export async function getInvoices(): Promise<{ live: boolean; invoices: InvoiceRow[]; outstanding: number; collected: number }> {
  const sb = getServiceClient();
  const tally = (rows: InvoiceRow[]) => ({
    outstanding: rows.filter((i) => i.status === "sent" || i.status === "overdue").reduce((s, i) => s + i.amount, 0),
    collected: rows.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
  });
  if (!sb) return { live: false, invoices: sampleInvoices, ...tally(sampleInvoices) };
  try {
    const { data, error } = await sb.from("invoices").select("*").order("due_date", { ascending: true }).limit(500);
    if (error) throw error;
    const invoices: InvoiceRow[] = (data ?? []).map((r: Row) => ({
      id: str(r.id), leadId: r.lead_id ? str(r.lead_id) : null, label: str(r.label, "Invoice"),
      amount: num(r.amount), dueDate: str(r.due_date), status: (str(r.status, "draft") as InvoiceRow["status"]),
      paidAt: r.paid_at ? str(r.paid_at) : null,
    }));
    return { live: true, invoices, ...tally(invoices) };
  } catch (e) {
    console.error("[data] getInvoices", e);
    return { live: true, invoices: [], outstanding: 0, collected: 0 };
  }
}

/* --- Operations (Phase 4) ------------------------------------------------- */

export async function getOpsTasks(): Promise<{ live: boolean; tasks: OpTask[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, tasks: sampleTasks };
  try {
    const { data, error } = await sb.from("op_tasks").select("*").order("due_at", { ascending: true }).limit(500);
    if (error) throw error;
    const tasks: OpTask[] = (data ?? []).map((r: Row) => ({
      id: str(r.id), title: str(r.title), category: (str(r.category, "other") as OpTask["category"]),
      assignee: str(r.assignee_name, "Unassigned"), dueAt: str(r.due_at), status: (str(r.status, "todo") as OpTask["status"]),
      recurring: r.recurring ? str(r.recurring) : undefined,
    }));
    return { live: true, tasks };
  } catch (e) { console.error("[data] getOpsTasks", e); return { live: true, tasks: [] }; }
}

export async function getInventory(): Promise<{ live: boolean; items: InventoryItem[]; lowCount: number }> {
  const sb = getServiceClient();
  const count = (rows: InventoryItem[]) => rows.filter(isLowStock).length;
  if (!sb) return { live: false, items: sampleInventory, lowCount: count(sampleInventory) };
  try {
    const { data, error } = await sb.from("inventory_items").select("*").order("name").limit(500);
    if (error) throw error;
    const items: InventoryItem[] = (data ?? []).map((r: Row) => ({
      id: str(r.id), name: str(r.name), category: str(r.category, "Other"),
      quantity: num(r.quantity), parLevel: num(r.par_level), unit: str(r.unit, "units"),
    }));
    return { live: true, items, lowCount: count(items) };
  } catch (e) { console.error("[data] getInventory", e); return { live: true, items: [], lowCount: 0 }; }
}

export async function getMaintenance(): Promise<{ live: boolean; assets: MaintenanceAsset[]; dueCount: number }> {
  const sb = getServiceClient();
  const count = (rows: MaintenanceAsset[]) => rows.filter((a) => maintenanceDueSoon(a)).length;
  if (!sb) return { live: false, assets: sampleMaintenance, dueCount: count(sampleMaintenance) };
  try {
    const { data, error } = await sb.from("maintenance_assets").select("*").order("next_service").limit(500);
    if (error) throw error;
    const assets: MaintenanceAsset[] = (data ?? []).map((r: Row) => ({
      id: str(r.id), name: str(r.name), kind: (str(r.kind, "other") as MaintenanceAsset["kind"]),
      lastService: str(r.last_service), nextService: str(r.next_service), intervalDays: num(r.interval_days, 90),
    }));
    return { live: true, assets, dueCount: count(assets) };
  } catch (e) { console.error("[data] getMaintenance", e); return { live: true, assets: [], dueCount: 0 }; }
}

export async function getStaff(): Promise<{ live: boolean; staff: StaffMember[] }> {
  const sb = getServiceClient();
  if (!sb) return { live: false, staff: sampleStaff };
  try {
    const { data, error } = await sb.from("staff").select("*, time_entries(clock_in,clock_out)").order("name").limit(200);
    if (error) throw error;
    const staff: StaffMember[] = (data ?? []).map((r: Row) => {
      const open = ((r.time_entries as Row[]) ?? []).find((t) => !t.clock_out);
      return {
        id: str(r.id), name: str(r.name), role: str(r.role, "Staff"),
        permissions: Array.isArray(r.permissions) ? (r.permissions as string[]) : [],
        hourlyRate: num(r.hourly_rate), active: Boolean(r.active),
        clockedInAt: open ? str(open.clock_in) : null,
      };
    });
    return { live: true, staff };
  } catch (e) { console.error("[data] getStaff", e); return { live: true, staff: [] }; }
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
