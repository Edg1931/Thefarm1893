import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Protects /dashboard once Supabase is configured. Until the client connects
 * their Supabase project (env vars unset), the dashboard stays open for demos.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.next(); // demo mode — no gate

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options as never));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const staffGated = path.startsWith("/dashboard");
  const portalGated = path.startsWith("/portal") || path.startsWith("/vendor-portal");
  // Guest check-in (/checkin/[token]) is intentionally NOT gated here — it's
  // authorized by its signed token, not a session.
  if (!user && (staffGated || portalGated)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", path);
    if (portalGated) loginUrl.searchParams.set("portal", "1");
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/vendor-portal/:path*"],
};
