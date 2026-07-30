/* ============================================================================
   EXTERNAL CALENDAR SYNC — Google (Calendar API) and Outlook (MS Graph) via
   OAuth for two-way sync; Apple/generic via the published .ics feed
   (/api/calendar/ical) + inbound iCal subscription. Mock-first: in demo the
   connect screens show a "connect (demo)" state and nothing is pushed.
   ============================================================================ */

export type CalProvider = "google" | "outlook" | "apple" | "airbnb" | "vrbo";

export function calendarSyncConfigured(provider?: CalProvider): boolean {
  if (provider === "google") return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID);
  if (provider === "outlook") return Boolean(process.env.MS_OAUTH_CLIENT_ID);
  return Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.MS_OAUTH_CLIENT_ID);
}

/** Whether a provider connects by OAuth or by subscribing to our iCal feed. */
export function connectMethod(provider: CalProvider): "oauth" | "ical" {
  return provider === "google" || provider === "outlook" ? "oauth" : "ical";
}

/** The public iCal feed others subscribe to (Apple Calendar, OTAs). */
export function icalFeedPath(): string {
  return "/api/calendar/ical";
}

/** Push a booking to a connected external calendar (mock in demo). */
export async function pushEvent(provider: CalProvider, event: { title: string; date: string }): Promise<{ ok: boolean; demo: boolean }> {
  if (!calendarSyncConfigured(provider)) {
    console.log(`[calendar-sync] (demo) would push to ${provider}:`, event);
    return { ok: true, demo: true };
  }
  // Real Google/Graph event insert would go here.
  return { ok: true, demo: false };
}
