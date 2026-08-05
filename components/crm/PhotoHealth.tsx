"use client";

import { useEffect, useState } from "react";
import { Images, Loader2, RefreshCw, CheckCircle2, AlertCircle, Folder, FileWarning } from "lucide-react";
import { Panel } from "@/components/crm/widgets";

type Expected = {
  folder: string; used: string; images: number;
  subfolders: string[]; skipped: string[]; firstFile: string | null;
};
type Diagnosis = {
  ok: boolean;
  problem: string | null;
  fix: string | null;
  usingKey: string;
  bucket: { name: string; public: boolean } | null;
  buckets: { name: string; public: boolean }[];
  rootEntries: { name: string; kind: "folder" | "file" }[];
  expected: Expected[];
  totalImages: number;
  sampleUrl: { url: string; status: number; ok: boolean } | null;
};

/**
 * Why uploaded photos aren't appearing on the site.
 *
 * "The pictures don't work" is nearly impossible to debug from the outside —
 * a wrong bucket name, a private bucket, and a mistyped folder all look
 * identical (a page with stock imagery). This shows what's really in Storage
 * next to what the site reads, so the mismatch is visible at a glance.
 */
export function PhotoHealth() {
  const [d, setD] = useState<Diagnosis | null>(null);
  const [busy, setBusy] = useState(true);

  async function load() {
    setBusy(true);
    try {
      const res = await fetch("/api/photos/diagnose");
      setD(await res.json());
    } catch {
      setD(null);
    } finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);

  return (
    <Panel
      title={<span className="flex items-center gap-2"><Images size={16} className="text-brass" /> Photos from Storage</span>}
      action={
        <button onClick={load} disabled={busy} className="flex items-center gap-1.5 text-sm text-brass hover:underline disabled:opacity-50">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Re-check
        </button>
      }
    >
      {busy && !d && <p className="text-sm text-stone">Checking the Photos bucket…</p>}

      {d && (
        <>
          {/* The verdict, in one sentence */}
          <div className={`mb-4 rounded-xl px-4 py-3 text-sm ring-1 ${d.ok ? "bg-sage/10 text-sage-deep ring-sage/25" : "bg-terracotta/8 text-ink ring-terracotta/25"}`}>
            <p className="flex items-start gap-2 font-medium">
              {d.ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0" /> : <AlertCircle size={15} className="mt-0.5 shrink-0 text-terracotta" />}
              {d.ok ? `${d.totalImages} photo${d.totalImages === 1 ? "" : "s"} found and serving correctly.` : d.problem}
            </p>
            {!d.ok && d.fix && <p className="mt-1.5 pl-[23px] text-ink-soft">{d.fix}</p>}
          </div>

          {/* What the site reads vs what's there */}
          <div className="space-y-1.5">
            {d.expected.map((e) => (
              <div key={e.folder} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-bone px-3 py-2 text-sm">
                <span className="flex items-center gap-1.5 font-mono text-xs text-ink">
                  <Folder size={12} className={e.images ? "text-sage-deep" : "text-stone"} /> {e.folder}/
                </span>
                <span className={`text-xs font-medium ${e.images ? "text-sage-deep" : "text-stone"}`}>
                  {e.images} image{e.images === 1 ? "" : "s"}
                  {e.subfolders.length > 0 && ` · ${e.subfolders.length} subfolder${e.subfolders.length === 1 ? "" : "s"}`}
                </span>
                <span className="ml-auto text-xs text-stone">{e.used}</span>
                {e.skipped.length > 0 && (
                  <p className="flex w-full items-start gap-1.5 text-xs text-terracotta">
                    <FileWarning size={12} className="mt-0.5 shrink-0" />
                    Ignored (unsupported format — convert to JPG): {e.skipped.join(", ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* What's actually sitting in the bucket — this is what reveals a typo */}
          {d.rootEntries.length > 0 && (
            <div className="mt-4 border-t border-ink/8 pt-4">
              <p className="text-xs uppercase tracking-wider text-stone">Actually in the bucket, at the top level</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.rootEntries.map((r) => (
                  <span key={r.name} className={`rounded-full px-2.5 py-1 font-mono text-xs ${r.kind === "folder" ? "bg-ink/8 text-ink-soft" : "bg-brass/12 text-brass"}`}>
                    {r.name}{r.kind === "folder" ? "/" : ""}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone">
                Names are case sensitive — <code className="rounded bg-bone px-1">Gallery/</code> is not the same folder as <code className="rounded bg-bone px-1">gallery/</code>.
              </p>
            </div>
          )}

          <div className="mt-4 space-y-1 border-t border-ink/8 pt-4 text-xs text-stone">
            <p>
              Bucket: {d.bucket ? <><code className="rounded bg-bone px-1">{d.bucket.name}</code> · {d.bucket.public ? "public ✓" : "PRIVATE — images will not load"}</> : "not found"}
              {" · "}Reading with the {d.usingKey}.
            </p>
            {d.sampleUrl && (
              <p>Test image returned HTTP {d.sampleUrl.status} {d.sampleUrl.ok ? "✓" : "✗"}.</p>
            )}
            <p>Pages re-read Storage about once a minute — a new upload appears without a redeploy.</p>
          </div>
        </>
      )}

      {!d && !busy && <p className="text-sm text-stone">Couldn&apos;t reach the diagnostic endpoint.</p>}
    </Panel>
  );
}
