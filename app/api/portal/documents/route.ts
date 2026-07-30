import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { createSignedUpload } from "@/lib/services/storage";
import { clientIp, rateLimit, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/** GET ?leadId=&name= — a signed upload URL (demo returns a placeholder). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const leadId = searchParams.get("leadId");
  const name = searchParams.get("name");
  if (!leadId || !name) return NextResponse.json({ error: "leadId and name required" }, { status: 400 });
  const safe = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const upload = await createSignedUpload(`${leadId}/${Date.now()}-${safe}`);
  return NextResponse.json(upload);
}

/** POST — record an uploaded document's metadata. Demo = no-op 200. */
export async function POST(req: Request) {
  if (!rateLimit(`portal-doc:${clientIp(req)}`, 30, 60_000)) return tooMany();
  try {
    const { leadId, name, path, kind = "other", uploadedBy = "couple" } = await req.json();
    if (!leadId || !name) return NextResponse.json({ error: "leadId and name required" }, { status: 400 });

    const sb = getServiceClient();
    if (!sb) return NextResponse.json({ ok: true, persisted: false });

    const { error } = await sb.from("documents").insert({ lead_id: leadId, name, path, kind, uploaded_by: uploadedBy });
    if (error) throw error;
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not save that document." }, { status: 500 });
  }
}
