import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * Persist seller edits to a silo listing (pricing, photos, options, reviews)
 * as JSONB keyed by slug, merged with what's already stored. Demo mode is a
 * graceful no-op (the browser store keeps the edit locally).
 */
export async function PATCH(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const body = await req.json();
    const { slug, ...patch } = body ?? {};
    if (!slug) return NextResponse.json({ error: "slug is required." }, { status: 400 });

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    const { data: existing } = await sb.from("silo_listings").select("data").eq("slug", slug).maybeSingle();
    const merged = { ...((existing?.data as Record<string, unknown>) ?? {}), ...patch };
    const { error } = await sb.from("silo_listings").upsert({ slug, data: merged, updated_at: new Date().toISOString() });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch (e) {
    console.error("silo patch error", e);
    return NextResponse.json({ error: "Could not save silo listing." }, { status: 500 });
  }
}
