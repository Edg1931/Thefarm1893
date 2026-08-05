"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import {
  Pencil, X, Check, Plus, Trash2, Star, BedDouble, Bath, Users, DollarSign, Info, ImageOff,
} from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { silos as seed, siloReviews, type Silo } from "@/lib/silos";
import { applySiloOverride, setSiloOverride, syncToApi, type SiloReview } from "@/lib/crm/store";
import { useModalClose } from "@/lib/useModalClose";
import { formatCurrency } from "@/lib/utils";
import { Toast } from "@/components/crm/Toast";

function seedReviews(silo: Silo): SiloReview[] {
  return siloReviews.filter((r) => r.stay === silo.name).map((r) => ({ name: r.name, text: r.text, rating: r.rating }));
}

export function SiloManager() {
  const [silos, setSilos] = useState<Silo[]>(seed);
  const [reviews, setReviews] = useState<Record<string, SiloReview[]>>({});
  const [editing, setEditing] = useState<Silo | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSilos(seed.map(applySiloOverride));
    const r: Record<string, SiloReview[]> = {};
    for (const s of seed) r[s.slug] = getStoredReviews(s) ?? seedReviews(s);
    setReviews(r);
  }, []);

  function flash(m: string) { setToast(m); setTimeout(() => setToast(""), 2400); }

  function save(slug: string, patch: Partial<Silo>, nextReviews: SiloReview[]) {
    setSiloOverride(slug, { ...patch, guestReviews: nextReviews });
    syncToApi("/api/silos", "PATCH", { slug, ...patch, guestReviews: nextReviews });
    setSilos((list) => list.map((s) => (s.slug === slug ? { ...s, ...patch } : s)));
    setReviews((r) => ({ ...r, [slug]: nextReviews }));
    setEditing(null);
    flash("Silo listing updated.");
  }

  return (
    <Panel title="Your silos" action={<span className="text-xs text-stone">{silos.length} listings</span>}>
      <p className="mb-4 flex items-start gap-1.5 rounded-lg bg-brass/8 p-3 text-xs leading-relaxed text-ink-soft">
        <Info size={14} className="mt-0.5 shrink-0 text-brass" />
        Edit pricing, photos, options, and reviews here — changes show across your CRM immediately, and publish to the live silo pages once your database is connected.
      </p>
      <div className="space-y-3">
        {silos.map((s) => (
          <div key={s.slug} className="flex items-center gap-3 rounded-xl bg-bone p-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-linen">
              {s.hero
                ? // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.hero} alt="" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                : <div className="grid h-full place-items-center text-stone"><ImageOff size={18} /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{s.name}</p>
              <p className="text-xs text-stone">
                {formatCurrency(s.nightly)}/night · sleeps {s.sleeps}
                {(reviews[s.slug]?.length ?? 0) > 0 && <> · <Star size={10} className="inline fill-brass text-brass" /> {reviews[s.slug].length}</>}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button onClick={() => setEditing(s)} className="flex items-center gap-1 rounded-lg bg-parchment px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-linen"><Pencil size={13} /> Edit</button>
              <Link href={`/silos/${s.slug}`} target="_blank" className="text-xs font-medium text-brass hover:underline">View ↗</Link>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <SiloEditor
          silo={editing}
          reviews={reviews[editing.slug] ?? []}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      {toast && (
        <Toast message={toast} />
      )}
    </Panel>
  );
}

function getStoredReviews(s: Silo): SiloReview[] | null {
  const o = applySiloOverride(s) as Silo & { guestReviews?: SiloReview[] };
  return o.guestReviews ?? null;
}

function SiloEditor({
  silo, reviews: r0, onClose, onSave,
}: {
  silo: Silo; reviews: SiloReview[];
  onClose: () => void; onSave: (slug: string, patch: Partial<Silo>, reviews: SiloReview[]) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalClose(onClose, dialogRef);
  const [f, setF] = useState({
    name: silo.name, tagline: silo.tagline, nightly: silo.nightly, cleaningFee: silo.cleaningFee,
    minNights: silo.minNights, sleeps: silo.sleeps, beds: silo.beds, baths: silo.baths, petFriendly: silo.petFriendly,
    hero: silo.hero,
  });
  const [gallery, setGallery] = useState<string[]>(silo.gallery.length ? silo.gallery : [""]);
  const [amenities, setAmenities] = useState(silo.amenities.join("\n"));
  const [reviews, setReviews] = useState<SiloReview[]>(r0);

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) { setF((s) => ({ ...s, [k]: v })); }

  function submit() {
    const patch: Partial<Silo> = {
      ...f,
      nightly: Number(f.nightly) || 0, cleaningFee: Number(f.cleaningFee) || 0, minNights: Number(f.minNights) || 1,
      sleeps: Number(f.sleeps) || 1, beds: Number(f.beds) || 1, baths: Number(f.baths) || 1,
      gallery: gallery.map((g) => g.trim()).filter(Boolean),
      amenities: amenities.split("\n").map((a) => a.trim()).filter(Boolean),
    };
    onSave(silo.slug, patch, reviews.filter((rv) => rv.name.trim() && rv.text.trim()));
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-parchment p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Edit {silo.name}</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>

        <div className="space-y-5">
          {/* Basics */}
          <div className="grid gap-4 sm:grid-cols-2">
            <L label="Listing name"><input value={f.name} onChange={(e) => set("name", e.target.value)} className={inp} /></L>
            <L label="Tagline"><input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} className={inp} /></L>
          </div>

          {/* Pricing */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brass">Pricing</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <L label="Nightly ($)"><Money v={f.nightly} on={(v) => set("nightly", v)} /></L>
              <L label="Cleaning fee ($)"><Money v={f.cleaningFee} on={(v) => set("cleaningFee", v)} /></L>
              <L label="Min. nights"><input type="number" min={1} value={f.minNights} onChange={(e) => set("minNights", Number(e.target.value))} className={inp} /></L>
            </div>
          </div>

          {/* Capacity */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brass">Capacity & options</p>
            <div className="grid gap-4 sm:grid-cols-4">
              <L label="Sleeps"><NumIcon icon={<Users size={14} />} v={f.sleeps} on={(v) => set("sleeps", v)} /></L>
              <L label="Beds"><NumIcon icon={<BedDouble size={14} />} v={f.beds} on={(v) => set("beds", v)} /></L>
              <L label="Baths"><NumIcon icon={<Bath size={14} />} v={f.baths} on={(v) => set("baths", v)} /></L>
              <label className="flex items-end gap-2 pb-2.5 text-sm text-ink-soft">
                <input type="checkbox" checked={f.petFriendly} onChange={(e) => set("petFriendly", e.target.checked)} className="h-4 w-4 rounded border-ink/30 accent-sage-deep" /> Pet-friendly
              </label>
            </div>
          </div>

          {/* Photos */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brass">Photos</p>
            <L label="Hero image URL"><input value={f.hero} onChange={(e) => set("hero", e.target.value)} placeholder="https://…" className={inp} /></L>
            <p className="mt-3 mb-1.5 text-xs font-medium text-stone">Gallery</p>
            <div className="space-y-2">
              {gallery.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <input value={g} onChange={(e) => setGallery((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} placeholder="https://…image.jpg" className={inp} />
                  <button onClick={() => setGallery((arr) => arr.filter((_, j) => j !== i))} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bone text-stone hover:bg-linen" aria-label="Remove"><Trash2 size={15} /></button>
                </div>
              ))}
              <button onClick={() => setGallery((arr) => [...arr, ""])} className="flex items-center gap-1 text-sm text-brass hover:underline"><Plus size={14} /> Add photo</button>
            </div>
          </div>

          {/* Amenities */}
          <L label="Amenities (one per line)">
            <textarea value={amenities} onChange={(e) => setAmenities(e.target.value)} rows={4} className={inp} />
          </L>

          {/* Reviews */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brass">Guest reviews</p>
            <div className="space-y-3">
              {reviews.map((rv, i) => (
                <div key={i} className="rounded-xl bg-bone p-3">
                  <div className="flex items-center gap-2">
                    <input value={rv.name} onChange={(e) => setReviews((a) => a.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="Guest name" className={`${inp} !py-2`} />
                    <select value={rv.rating} onChange={(e) => setReviews((a) => a.map((x, j) => (j === i ? { ...x, rating: Number(e.target.value) } : x)))} className={`${inp} !w-24 !py-2`}>
                      {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                    <button onClick={() => setReviews((a) => a.filter((_, j) => j !== i))} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-parchment text-stone hover:bg-linen" aria-label="Remove review"><Trash2 size={15} /></button>
                  </div>
                  <textarea value={rv.text} onChange={(e) => setReviews((a) => a.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} rows={2} placeholder="What they said…" className={`${inp} mt-2 !py-2`} />
                </div>
              ))}
              <button onClick={() => setReviews((a) => [...a, { name: "", text: "", rating: 5 }])} className="flex items-center gap-1 text-sm text-brass hover:underline"><Plus size={14} /> Add review</button>
            </div>
          </div>

          <div className="flex gap-3 border-t border-ink/8 pt-4">
            <button onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button onClick={submit} className="btn btn-primary flex-1 !py-2.5"><Check size={15} /> Save Listing</button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inp = "w-full rounded-xl border border-ink/15 bg-bone px-3 py-2.5 text-sm outline-none focus:border-sage";

function L({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1.5"><span className="text-xs font-medium uppercase tracking-wider text-stone">{label}</span>{children}</label>;
}
function Money({ v, on }: { v: number; on: (v: number) => void }) {
  return (
    <div className="flex items-center rounded-xl border border-ink/15 bg-bone px-3">
      <DollarSign size={14} className="text-stone" />
      <input type="number" min={0} value={v} onChange={(e) => on(Number(e.target.value))} className="w-full bg-transparent px-1 py-2.5 text-sm outline-none" />
    </div>
  );
}
function NumIcon({ icon, v, on }: { icon: React.ReactNode; v: number; on: (v: number) => void }) {
  return (
    <div className="flex items-center rounded-xl border border-ink/15 bg-bone px-3 text-stone">
      {icon}
      <input type="number" min={0} value={v} onChange={(e) => on(Number(e.target.value))} className="w-full bg-transparent px-1 py-2.5 text-sm text-ink outline-none" />
    </div>
  );
}
