import { NextResponse } from "next/server";
import { calendarSyncConfigured, type CalProvider } from "@/lib/services/calendar-sync";

export const runtime = "nodejs";

/**
 * Begins an external-calendar OAuth flow.
 *
 * The connect buttons previously linked straight at the *callback* route with
 * no `code` param, so an auth flow could never actually start. When a provider's
 * client id isn't configured we bounce back to Settings with a clear status
 * rather than showing the user a broken consent screen.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const provider = (searchParams.get("provider") ?? "google") as CalProvider;

  if (!calendarSyncConfigured(provider)) {
    return NextResponse.redirect(`${origin}/dashboard/settings?calendar=needs-keys&provider=${provider}`);
  }

  const redirectUri = `${origin}/api/integrations/calendar/callback?provider=${provider}`;

  if (provider === "google") {
    const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    u.searchParams.set("client_id", process.env.GOOGLE_OAUTH_CLIENT_ID as string);
    u.searchParams.set("redirect_uri", redirectUri);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("access_type", "offline");
    u.searchParams.set("prompt", "consent");
    u.searchParams.set("scope", "https://www.googleapis.com/auth/calendar");
    return NextResponse.redirect(u.toString());
  }

  if (provider === "outlook") {
    const u = new URL("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
    u.searchParams.set("client_id", process.env.MS_OAUTH_CLIENT_ID as string);
    u.searchParams.set("redirect_uri", redirectUri);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", "offline_access Calendars.ReadWrite");
    return NextResponse.redirect(u.toString());
  }

  // Apple / Airbnb / VRBO sync by iCal — nothing to authorize.
  return NextResponse.redirect(`${origin}/dashboard/settings#ical-import`);
}
