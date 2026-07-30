import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { clientIp, rateLimit, tooMany } from "@/lib/api/guard";

export const runtime = "nodejs";

/**
 * POST — public guest RSVP from a wedding microsite. Captures the response into
 * the CRM (rsvps) and, when the guest opts in, seeds a future-couple lead. Demo
 * mode logs and returns a graceful no-op so the microsite still confirms.
 */
export async function POST(req: Request) {
  if (!rateLimit(`rsvp:${clientIp(req)}`, 20, 60_000)) return tooMany();
  try {
    const b = await req.json();
    const weddingSlug = String(b.weddingSlug ?? b.slug ?? "").trim();
    const guestName = String(b.guestName ?? b.name ?? "").trim();
    if (!weddingSlug || !guestName) return NextResponse.json({ error: "name and wedding required" }, { status: 400 });

    const row = {
      wedding_slug: weddingSlug,
      guest_name: guestName,
      email: b.email ? String(b.email).trim() : null,
      party_size: Math.max(1, Number(b.partySize) || 1),
      meal: b.meal ? String(b.meal) : null,
      status: b.status === "declined" ? "declined" : "attending",
      future_couple: Boolean(b.futureCouple),
    };

    const sb = getServiceClient();
    if (!sb) {
      console.log("[rsvp] (demo) captured:", row);
      return NextResponse.json({ ok: true, persisted: false });
    }
    const { error } = await sb.from("rsvps").insert(row);
    if (error) throw error;

    // Guest opted in as a future couple → capture a nurture lead.
    if (row.future_couple && row.email) {
      await sb.from("leads").insert({
        name: guestName, email: row.email, source: "wedding-guest", segment: "wedding",
        ai_summary: `Wedding guest at ${weddingSlug} — opted in as a future couple. Nurture 6–12 months.`,
      });
    }
    return NextResponse.json({ ok: true, persisted: true });
  } catch {
    return NextResponse.json({ error: "Could not record your RSVP." }, { status: 500 });
  }
}
