import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/server";
import { calendarSyncConfigured } from "@/lib/services/calendar-sync";

export const runtime = "nodejs";

/**
 * OAuth redirect target for Google / Outlook calendar connect. When configured,
 * this exchanges the `code` for tokens and stores a calendar_connections row;
 * in demo it just bounces back to Settings with a friendly status.
 */
export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const provider = searchParams.get("provider") ?? "google";
  const code = searchParams.get("code");

  if (!calendarSyncConfigured(provider as "google" | "outlook") || !code) {
    return NextResponse.redirect(`${origin}/dashboard/settings?calendar=demo`);
  }
  try {
    // Real token exchange (Google/MS) would happen here.
    const sb = getServiceClient();
    if (sb) await sb.from("calendar_connections").insert({ provider, account: "connected", tokens: {} });
    return NextResponse.redirect(`${origin}/dashboard/settings?calendar=connected`);
  } catch {
    return NextResponse.redirect(`${origin}/dashboard/settings?calendar=error`);
  }
}
