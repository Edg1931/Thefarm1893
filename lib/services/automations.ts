/* ============================================================================
   AUTOMATIONS ENGINE — promotes the drip/workflow list from display-only to a
   real runner. `runTrigger` is invoked by API events (a lead created, a stay
   checked out) and by the /api/automations/tick cron for time-based rules. It
   dispatches each active rule's action to the right adapter (email/SMS/social).
   Mock-first: in demo it logs what it would do.
   ============================================================================ */

import { getServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/services/email";

export type AutomationContext = { email?: string; name?: string; [k: string]: unknown };

/** Run any active automations whose trigger matches. Returns how many fired. */
export async function runTrigger(trigger: string, ctx: AutomationContext = {}): Promise<{ fired: number; demo: boolean }> {
  const sb = getServiceClient();
  if (!sb) {
    console.log(`[automations] (demo) trigger "${trigger}" with`, ctx);
    return { fired: 0, demo: true };
  }
  try {
    const { data } = await sb.from("automations").select("*").eq("active", true).eq("trigger", trigger);
    let fired = 0;
    for (const rule of (data ?? []) as Record<string, unknown>[]) {
      await dispatchAction(String(rule.action), ctx);
      await sb.from("automations").update({ runs: (Number(rule.runs) || 0) + 1 }).eq("id", rule.id as string);
      fired++;
    }
    return { fired, demo: false };
  } catch (e) {
    console.error("[automations] runTrigger", e);
    return { fired: 0, demo: false };
  }
}

async function dispatchAction(action: string, ctx: AutomationContext) {
  const [channel] = action.split(":");
  if (channel === "email" && ctx.email) {
    await sendEmail({ to: ctx.email, subject: "A note from The Farm 1893 🌾", html: `<p>Hi ${ctx.name ?? "there"}!</p><p>(${action})</p>` });
  }
  // sms / sequence dispatch would branch here.
}

/** Human-readable label for an action string (used in the builder UI). */
export function describeAction(action: string): string {
  const map: Record<string, string> = {
    "email:welcome": "Send welcome email",
    "email:nudge": "Send follow-up nudge",
    "email:review-request": "Request a review",
    "email:reminder": "Send balance reminder",
    "sequence:guest-nurture": "Enroll in guest→couple nurture",
  };
  return map[action] ?? action;
}
