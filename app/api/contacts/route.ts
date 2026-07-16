import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Create a contact/lead. Persists to Supabase when configured. */
export async function POST(req: Request) {
  try {
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
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ error: "id is required." }, { status: 400 });
    const supabase = getServiceClient();
    if (supabase) {
      const { id, ...patch } = body;
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
