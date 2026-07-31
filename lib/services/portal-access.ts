/* ============================================================================
   PORTAL ACCESS RESOLVER — decides whether the current visitor may see a given
   booking's private data. Three ways in, checked in order:

     1. DEMO MODE (Supabase unconfigured) — open, so walkthroughs need no inbox.
     2. SIGNED TOKEN (?t=...) — a per-booking link we issued (scope "portal").
        Zero-account access for couples/vendors who just click their email link.
     3. MAGIC-LINK SESSION — a signed-in Supabase user bound to the booking by a
        `portal_members` row (or a staff member, who may view any booking).

   Anything else is denied. This replaces "trust the leadId in the URL".
   ============================================================================ */

import { getUser } from "@/lib/api/guard";
import { getServiceClient } from "@/lib/supabase/server";
import { verifyToken } from "@/lib/services/portal-auth";
import { portalAuthConfigured } from "@/lib/services/portal-auth";

export type PortalAccess =
  | { ok: true; via: "demo" | "token" | "member" | "staff"; leadId: string }
  | { ok: false; reason: "signin" | "denied" };

/** Can this visitor open the couple portal for `leadId`? */
export async function resolvePortalAccess(leadId: string, token?: string): Promise<PortalAccess> {
  // 1. Demo mode — no auth layer configured at all.
  if (!portalAuthConfigured()) return { ok: true, via: "demo", leadId };

  // 2. Signed per-booking link.
  if (token) {
    const payload = verifyToken(token);
    if (payload && payload.scope === "portal" && payload.t === "lead" && payload.id === leadId) {
      return { ok: true, via: "token", leadId };
    }
  }

  // 3. Signed-in user bound to this booking (or staff).
  const user = await getUser();
  if (!user) return { ok: false, reason: "signin" };

  const sb = getServiceClient();
  if (!sb) return { ok: false, reason: "denied" };

  try {
    const { data: member } = await sb
      .from("portal_members")
      .select("id, role")
      .eq("user_id", user.id)
      .eq("lead_id", leadId)
      .maybeSingle();
    if (member) return { ok: true, via: "member", leadId };

    // Staff (anyone on the staff roster) may view any client's portal.
    const { data: staff } = await sb.from("staff").select("id").eq("user_id", user.id).maybeSingle();
    if (staff) return { ok: true, via: "staff", leadId };
  } catch (e) {
    console.error("[portal-access] resolve", e);
  }
  return { ok: false, reason: "denied" };
}

export type VendorAccess =
  | { ok: true; via: "demo" | "member" | "staff"; vendorId: string | null }
  | { ok: false; reason: "signin" | "denied" };

/** Can this visitor open the vendor portal? */
export async function resolveVendorAccess(): Promise<VendorAccess> {
  if (!portalAuthConfigured()) return { ok: true, via: "demo", vendorId: null };

  const user = await getUser();
  if (!user) return { ok: false, reason: "signin" };

  const sb = getServiceClient();
  if (!sb) return { ok: false, reason: "denied" };

  try {
    const { data: member } = await sb
      .from("portal_members")
      .select("vendor_id")
      .eq("user_id", user.id)
      .eq("role", "vendor")
      .maybeSingle();
    if (member) return { ok: true, via: "member", vendorId: member.vendor_id ? String(member.vendor_id) : null };

    const { data: staff } = await sb.from("staff").select("id").eq("user_id", user.id).maybeSingle();
    if (staff) return { ok: true, via: "staff", vendorId: null };
  } catch (e) {
    console.error("[portal-access] vendor", e);
  }
  return { ok: false, reason: "denied" };
}
