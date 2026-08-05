import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createSignedUpload } from "@/lib/services/storage";
import { requireRole } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * Before/after/damage photos for a turnover. They land in the PRIVATE
 * `documents` bucket, not the public `Photos` one — a damage shot of a guest's
 * room should never be world-readable.
 *
 * GET ?turnoverId=&name=&phase=  → signed upload URL
 * POST                           → record the stored path
 */
export async function GET(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  const { searchParams } = new URL(req.url);
  const turnoverId = searchParams.get("turnoverId");
  const name = searchParams.get("name");
  if (!turnoverId || !name) return NextResponse.json({ error: "turnoverId and name required" }, { status: 400 });
  const phase = searchParams.get("phase") ?? "before";
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const upload = await createSignedUpload(`turnovers/${turnoverId}/${phase}-${Date.now()}-${safe}`);
  return NextResponse.json(upload);
}

export async function POST(req: Request) {
  const denied = await requireRole("operations");
  if (denied) return denied;
  try {
    const { turnoverId, path, phase = "before", caption } = await req.json();
    if (!turnoverId || !path) return NextResponse.json({ error: "turnoverId and path required" }, { status: 400 });
    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });
    const { error } = await sb.from("turnover_photos").insert({ turnover_id: turnoverId, path, phase, caption: caption ?? null });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not save that photo." }, { status: 500 });
  }
}
