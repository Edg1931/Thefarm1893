import { NextResponse } from "next/server";
import { getCalendar } from "@/lib/crm/data";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";

export const runtime = "nodejs";

/** GET — the unified calendar feed (events + silo stays + availability blocks). */
export async function GET() {
  try {
    const { live, items, blocks } = await getCalendar();
    return NextResponse.json({ live, items, blocks });
  } catch {
    return NextResponse.json({ error: "Could not load the calendar." }, { status: 500 });
  }
}

/** POST — add an availability block / manual hold. Staff-gated in live mode. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { resourceSlug = "venue", resourceKind = "venue", start, end, reason = "Manual hold", source = "manual" } = body ?? {};
    if (!start) return NextResponse.json({ error: "start date required" }, { status: 400 });

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    const { error } = await sb.from("availability_blocks").insert({
      resource_slug: resourceSlug,
      start_date: start,
      end_date: end ?? start,
      reason,
      source,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true, resourceKind });
  } catch {
    return NextResponse.json({ error: "Could not save that hold." }, { status: 500 });
  }
}
