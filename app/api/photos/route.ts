import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/guard";
import { listPhotos, listPhotosDeep } from "@/lib/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lists photos in a Storage folder for the marketing photo picker (staff only). */
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const url = new URL(req.url);
  const folder = url.searchParams.get("folder") ?? "gallery";
  const deep = url.searchParams.get("deep") === "1";
  const photos = deep ? await listPhotosDeep(folder) : await listPhotos(folder);
  return NextResponse.json({ folder, photos });
}
