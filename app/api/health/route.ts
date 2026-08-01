import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/guard";
import { getServiceClient } from "@/lib/supabase/server";
import { DOCUMENTS_BUCKET } from "@/lib/services/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GO-LIVE HEALTH CHECK — reports what is *actually* true in the live database,
 * not just which env vars exist. Powers the checklist on Dashboard →
 * Integrations so the client can see the moment the DB really comes online.
 * Staff-gated; read-only. In demo mode it reports connected:false and says so.
 */
type Check = { key: string; ok: boolean; label: string; detail: string };

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const sb = getServiceClient();
  const checks: Check[] = [];

  if (!sb) {
    return NextResponse.json({
      connected: false,
      checks: [{
        key: "supabase", ok: false, label: "Database connection",
        detail: "Running in demo mode — add the Supabase keys in Vercel to go live.",
      }],
    });
  }

  // 1. Can we actually reach the database?
  let reachable = false;
  try {
    const { error } = await sb.from("leads").select("id", { count: "exact", head: true });
    reachable = !error;
    checks.push({
      key: "supabase", ok: reachable, label: "Database connection",
      detail: reachable ? "Connected — the CRM is reading and writing real rows." : `Could not query the database: ${error?.message ?? "unknown error"}`,
    });
  } catch (e) {
    checks.push({ key: "supabase", ok: false, label: "Database connection", detail: e instanceof Error ? e.message : "Connection failed." });
  }

  if (reachable) {
    // 2. Baseline rows from seed.sql — the availability engine needs these.
    try {
      const { data } = await sb.from("resources").select("slug");
      const slugs = (data ?? []).map((r: { slug: string | null }) => r.slug);
      const need = ["venue", "the-orchard-silo", "the-harvest-silo", "the-copper-silo", "the-meadow-silo"];
      const missing = need.filter((s) => !slugs.includes(s));
      checks.push({
        key: "seed", ok: missing.length === 0, label: "Bookable resources seeded",
        detail: missing.length === 0
          ? `All ${need.length} resources present (venue + 4 silos).`
          : `Run supabase/seed.sql — missing: ${missing.join(", ")}.`,
      });
    } catch {
      checks.push({ key: "seed", ok: false, label: "Bookable resources seeded", detail: "Could not read the resources table — has schema.sql been run?" });
    }

    // 3. Private documents bucket for portal/contract/insurance uploads.
    try {
      const { data } = await sb.storage.listBuckets();
      const bucket = (data ?? []).find((b: { name: string }) => b.name === DOCUMENTS_BUCKET);
      checks.push({
        key: "documents", ok: Boolean(bucket), label: "Private documents bucket",
        detail: bucket ? `Bucket "${DOCUMENTS_BUCKET}" found.` : `Create a PRIVATE bucket named "${DOCUMENTS_BUCKET}" in Storage.`,
      });
    } catch {
      checks.push({ key: "documents", ok: false, label: "Private documents bucket", detail: "Could not list storage buckets." });
    }

    // 4. At least one staff row, so permissions + time clock work.
    try {
      const { count } = await sb.from("staff").select("id", { count: "exact", head: true });
      const n = count ?? 0;
      checks.push({
        key: "staff", ok: n > 0, label: "Staff accounts linked",
        detail: n > 0 ? `${n} staff member${n === 1 ? "" : "s"} linked.` : "Add a Supabase auth user, then insert a matching `staff` row (see seed.sql).",
      });
    } catch {
      checks.push({ key: "staff", ok: false, label: "Staff accounts linked", detail: "Could not read the staff table." });
    }

    // 5. Live data volume — a friendly signal, never a failure.
    try {
      const [leads, events] = await Promise.all([
        sb.from("leads").select("id", { count: "exact", head: true }),
        sb.from("events").select("id", { count: "exact", head: true }),
      ]);
      checks.push({
        key: "data", ok: true, label: "Live data",
        detail: `${leads.count ?? 0} lead${leads.count === 1 ? "" : "s"} · ${events.count ?? 0} booking${events.count === 1 ? "" : "s"} in the database.`,
      });
    } catch { /* non-critical */ }
  }

  return NextResponse.json({ connected: reachable, checks });
}
