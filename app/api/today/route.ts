import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/guard";
import { getToday } from "@/lib/crm/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Everything needing attention in the next few days — feeds the topbar bell. */
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { live, items } = await getToday();
  return NextResponse.json({ live, items });
}
