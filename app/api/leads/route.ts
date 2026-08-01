import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { scoreLead } from "@/lib/services/insights";
import { rateLimit, clientIp, tooMany } from "@/lib/api/guard";
import { sendEmail } from "@/lib/services/email";
import { runTrigger } from "@/lib/services/automations";
import { business } from "@/lib/content";

export const runtime = "nodejs";

/** Plain-text-ish HTML alert so the venue sees a new inquiry immediately. */
function alertHtml(lead: Record<string, unknown>, score: { score: number; priority: string; summary: string }) {
  const row = (k: string, v: unknown) => (v ? `<tr><td style="padding:4px 12px 4px 0;color:#6b6b6b">${k}</td><td style="padding:4px 0"><b>${String(v)}</b></td></tr>` : "");
  return `
    <div style="font-family:system-ui,sans-serif">
      <h2 style="margin:0 0 4px">New ${String(lead.event_type ?? "inquiry")} inquiry</h2>
      <p style="margin:0 0 12px;color:#6b6b6b">Score ${score.score}/100 · ${score.priority.toUpperCase()}</p>
      <table style="border-collapse:collapse;font-size:14px">
        ${row("Name", lead.name)}${row("Email", lead.email)}${row("Phone", lead.phone)}
        ${row("Event date", lead.event_date)}${row("Guests", lead.guest_count)}
        ${row("Budget", lead.budget)}${row("Heard about us", lead.heard_about)}${row("Source", lead.source)}
      </table>
      ${lead.message ? `<p style="margin:12px 0 0"><i>"${String(lead.message)}"</i></p>` : ""}
      <p style="margin:16px 0 0;padding:12px;background:#f6f1e7;border-radius:8px;font-size:13px">
        <b>AI:</b> ${score.summary}
      </p>
    </div>`;
}

export async function POST(req: Request) {
  if (!rateLimit(`leads:${clientIp(req)}`, 10, 60_000)) return tooMany();
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

    /* Tell the venue a lead came in, and start any "lead.created" automations.
       Deliberately best-effort and non-blocking: a mail or automation hiccup
       must never turn a captured lead into an error for the couple. In demo
       mode both adapters log instead of sending. */
    const notify = process.env.NOTIFY_EMAIL || business.email;
    void Promise.allSettled([
      sendEmail({
        to: notify,
        subject: `${score.priority === "hot" ? "🔥 HOT " : ""}New inquiry — ${name}${eventDate ? ` · ${eventDate}` : ""}`,
        html: alertHtml(lead, score),
      }),
      runTrigger("lead.created", { email: email ?? undefined, name }),
    ]).catch(() => { /* never surfaces to the guest */ });

    return NextResponse.json({ ok: true, score });
  } catch (e) {
    console.error("lead error", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
