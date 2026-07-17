import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { scoreLead } from "@/lib/services/insights";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, eventDate, guestCount, eventType, message, source,
      budget, heardAbout, style, segment } = body;

    if (!name || (!email && !phone)) {
      return NextResponse.json({ error: "Name and a contact method are required." }, { status: 400 });
    }

    // AI lead scoring (pluggable — heuristic today, model-backed when key added).
    const score = scoreLead({ eventDate, guestCount, eventType, message, budget });

    const lead = {
      name,
      email: email ?? null,
      phone: phone ?? null,
      event_date: eventDate ?? null,
      guest_count: guestCount ? Number(guestCount) : null,
      event_type: eventType ?? "wedding",
      message: message ?? null,
      source: source ?? "website",
      // Richer intake — powers catering prep, attribution, and segmentation.
      budget: budget ?? null,
      heard_about: heardAbout ?? null,   // marketing attribution
      style: style ?? null,               // vibe for catering/design + targeting
      segment: segment ?? "wedding",      // wedding | vrbo | future-couple | corporate
      stage: "new",
      score: score.score,
      ai_priority: score.priority,
      ai_summary: score.summary,
      created_at: new Date().toISOString(),
    };

    const supabase = getServiceClient();
    if (supabase) {
      const { error } = await supabase.from("leads").insert(lead);
      if (error) throw error;
    } else {
      // Demo mode — no DB configured. Surface it so nothing is silently lost.
      console.log("[LEAD — demo mode, not persisted]", lead);
    }

    return NextResponse.json({ ok: true, score });
  } catch (e) {
    console.error("lead error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
