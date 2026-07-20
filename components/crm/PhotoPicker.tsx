"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ImageOff, Images } from "lucide-react";
import { marketingPhotoSources, marketingPhotoGroups } from "@/lib/photo-categories";

/** Browse the venue's Storage photos by category and pick one for marketing content. */
export function PhotoPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [srcIdx, setSrcIdx] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const src = marketingPhotoSources[srcIdx];
    let cancelled = false;
    setLoading(true);
    fetch(`/api/photos?folder=${encodeURIComponent(src.folder)}${src.deep ? "&deep=1" : ""}`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setPhotos(Array.isArray(d.photos) ? d.photos : []); })
      .catch(() => { if (!cancelled) setPhotos([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [srcIdx]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-parchment p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-2xl text-ink"><Images size={20} className="text-brass" /> Insert a photo</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <label className="text-xs font-medium uppercase tracking-wider text-stone">Album</label>
          <select
            value={srcIdx}
            onChange={(e) => setSrcIdx(Number(e.target.value))}
            className="flex-1 rounded-xl border border-ink/15 bg-bone px-3 py-2.5 text-sm outline-none focus:border-sage"
          >
            {marketingPhotoGroups.map((g) => (
              <optgroup key={g} label={g}>
                {marketingPhotoSources.map((s, i) => (s.group === g ? <option key={s.folder} value={i}>{s.label}</option> : null))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid h-48 place-items-center text-stone"><Loader2 className="animate-spin" /></div>
          ) : photos.length === 0 ? (
            <div className="grid h-48 place-items-center text-center text-sm text-stone">
              <div><ImageOff className="mx-auto mb-2" /> No photos in this album yet.<br />Add some in Supabase → Storage → Photos.</div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {photos.map((src) => (
                <button
                  key={src}
                  onClick={() => onPick(src)}
                  className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-ink/10 transition hover:ring-2 hover:ring-brass"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                  <span className="absolute inset-0 grid place-items-center bg-ink/0 text-xs font-medium text-parchment opacity-0 transition group-hover:bg-ink/40 group-hover:opacity-100">Insert</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
