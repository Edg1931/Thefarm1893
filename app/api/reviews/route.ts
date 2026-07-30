import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/api/guard";
import { getReviews } from "@/lib/crm/data";
import { requestReview } from "@/lib/services/reviews";

export const runtime = "nodejs";

/** GET — aggregated reviews + rating summary. */
export async function GET() {
  const { live, reviews, summary } = await getReviews();
  return NextResponse.json({ live, reviews, summary });
}

/** POST { action: "request", to, name } — send a review request email. */
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { action, to, name } = await req.json();
    if (action === "request") {
      if (!to) return NextResponse.json({ error: "recipient required" }, { status: 400 });
      const r = await requestReview(String(to), String(name ?? "there"));
      const sb = getServiceClient();
      if (sb) await sb.from("review_requests").insert({ channel: "email", sent_at: new Date().toISOString() });
      return NextResponse.json({ ...r });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "Could not process." }, { status: 500 }); }
}
