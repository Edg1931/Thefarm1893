import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** TEMPORARY diagnostic — reports what Supabase Storage returns. Delete after. */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const env = {
    hasUrl: Boolean(url),
    urlHost: url ? new URL(url).host : null,
    hasServiceKey: Boolean(service),
    hasAnonKey: Boolean(anon),
  };
  const key = service || anon;
  if (!url || !key) return NextResponse.json({ env, error: "missing url or key" });

  const usingKey = service ? "service_role" : "anon";
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  async function probe(folder: string) {
    try {
      const { data, error } = await sb.storage.from("Photos").list(folder, { limit: 100 });
      return { folder, count: data?.length ?? 0, names: (data ?? []).map((f) => f.name).slice(0, 8), error: error?.message ?? null };
    } catch (e) {
      return { folder, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Also try to list buckets, to confirm the bucket name.
  let buckets: unknown = null;
  try {
    const { data, error } = await sb.storage.listBuckets();
    buckets = error ? { error: error.message } : (data ?? []).map((b) => ({ name: b.name, public: b.public }));
  } catch (e) {
    buckets = { error: e instanceof Error ? e.message : String(e) };
  }

  const probes = await Promise.all([probe(""), probe("hero"), probe("gallery"), probe("silos"), probe("silos/the-orchard-silo")]);
  return NextResponse.json({ env, usingKey, buckets, probes });
}
