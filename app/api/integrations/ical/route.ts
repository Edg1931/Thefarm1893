import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";
import { importIcalFeed } from "@/lib/services/ota";

export const runtime = "nodejs";

/**
 * POST { url, resourceSlug } — import an Airbnb/VRBO/Google iCal feed and write
 * the busy ranges into availability_blocks (source "ota"), closing the sync
 * loop so an OTA booking blocks the dates in Venue OS. Demo returns a preview.
 */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { url, resourceSlug = "venue" } = await req.json();
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
    const blocks = await importIcalFeed(String(url));

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false, imported: blocks.length, sample: blocks.slice(0, 5) });

    // Replace this feed's previously-imported blocks, then insert the current set.
    await sb.from("availability_blocks").delete().eq("resource_slug", resourceSlug).eq("source", "ota");
    let imported = 0;
    if (blocks.length) {
      const rows = blocks.map((b) => ({ resource_slug: resourceSlug, start_date: b.start, end_date: b.end, reason: b.summary, source: "ota", external_id: b.uid }));
      const { error } = await sb.from("availability_blocks").insert(rows);
      if (!error) imported = rows.length;
    }
    return NextResponse.json({ ok: true, persisted: true, imported });
  } catch { return NextResponse.json({ error: "Could not import the calendar feed." }, { status: 500 }); }
}
