"use client";

import { useRef, useState } from "react";
import { Upload, FileText, Check } from "lucide-react";
import { syncToApi } from "@/lib/crm/store";

/**
 * Lightweight document upload for the portal. Requests a signed upload URL,
 * (would) PUT the bytes when live, then records the metadata via
 * /api/portal/documents. In demo mode it captures the filename and confirms.
 */
export function DocumentUpload({ leadId, kind = "inspiration" }: { leadId: string; kind?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/portal/documents?leadId=${encodeURIComponent(leadId)}&name=${encodeURIComponent(file.name)}`);
      const { url, path, demo } = await res.json();
      if (!demo && url && !url.startsWith("#")) {
        await fetch(url, { method: "PUT", body: file }).catch(() => {});
      }
      syncToApi("/api/portal/documents", "POST", { leadId, name: file.name, path: path ?? file.name, kind, uploadedBy: "couple" });
      setAdded((a) => [file.name, ...a]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input ref={inputRef} type="file" className="hidden" onChange={onFile} />
      <button onClick={() => inputRef.current?.click()} disabled={busy} className="btn btn-ghost !py-2 !text-xs disabled:opacity-60">
        <Upload size={14} /> {busy ? "Uploading…" : "Upload a file"}
      </button>
      {added.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {added.map((n, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-ink-soft"><Check size={14} className="text-sage-deep" /> <FileText size={14} className="text-stone" /> {n}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
