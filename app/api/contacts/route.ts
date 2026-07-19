import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";

export const runtime = "nodejs";

// Columns a client is allowed to set/update on a lead (prevents mass-assignment).
const EDITABLE = ["name", "email", "phone", "event_type", "event_date", "guest_count", "budget", "stage", "score", "ai_summary", "heard_about", "style", "segment"] as const;
const CAMEL: Record<string, string> = { eventType: "event_type", eventDate: "event_date", guestCount: "guest_count", aiSummary: "ai_summary", heardAbout: "heard_about" };
function pickEditable(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(body)) {
    const col = CAMEL[k] ?? k;
    if ((EDITABLE as readonly string[]).includes(col)) out[col] = col === "guest_count" && v ? Number(v) : v;
  }
  return out;
}

/** Create a contact/lead. Persists to Supabase when configured. */
export async function POST(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const body = await req.json();
    if (!body?.name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
    const supabase = getServiceClient();
    if (supabase) {
      const { error } = await supabase.from("leads").insert({
        name: body.name,
        email: body.email ?? null,
        phone: body.phone ?? null,
        event_type: body.eventType ?? "Wedding",
        event_date: body.eventDate ?? null,
        guest_count: body.guestCount ? Number(body.guestCount) : null,
        stage: body.stage ?? "new",
        source: "crm-manual",
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }
    return NextResponse.json({ ok: true, persisted: false });
  } catch (e) {
    console.error("contact add error", e);
    return NextResponse.json({ error: "Could not add contact." }, { status: 500 });
  }
}

/** Edit an existing contact/lead by id. */
export async function PATCH(req: Request) {
  try {
    const denied = await requireAdmin();
    if (denied) return denied;
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    const supabase = getServiceClient();
    if (supabase) {
      const { id } = body;
      const patch = pickEditable(body); // whitelist — never trust the raw body
      if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true, persisted: false });
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ ok: true, persisted: true });
    }
    return NextResponse.json({ ok: true, persisted: false });
  } catch (e) {
    console.error("contact edit error", e);
    return NextResponse.json({ error: "Could not save changes." }, { status: 500 });
  }
}
