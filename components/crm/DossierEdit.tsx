"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail, Phone, CalendarDays, Users, ExternalLink, Sparkles, Pencil, X, Check, StickyNote } from "lucide-react";
import { PriorityBadge, Panel } from "@/components/crm/widgets";
import { type Lead } from "@/lib/crm/sample-data";
import { getContactOverrides, setContactOverride, syncToApi } from "@/lib/crm/store";
import { formatDate } from "@/lib/utils";

const EVENT_TYPES = ["Wedding", "Corporate Retreat", "Anniversary", "Bridal Shower", "Celebration of Life", "Other"];
const STAGES = ["new", "toured", "proposal", "booked", "lost"];

export function DossierHeader({ lead: seed, micrositeSlug }: { lead: Lead; micrositeSlug: string | null }) {
  const [lead, setLead] = useState<Lead>(seed);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const o = getContactOverrides()[seed.id];
    if (o) setLead({ ...seed, ...o });
  }, [seed]);

  function save(updated: Lead) {
    const { id, ...patch } = updated;
    setContactOverride(id, patch);
    syncToApi("/api/contacts", "PATCH", updated);
    setLead(updated);
    setEditing(false);
  }

  return (
    <div className="rounded-2xl bg-[color:var(--color-ink)] p-7 text-parchment shadow-[var(--shadow-soft)]">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-brass/20 font-display text-2xl text-brass-soft ring-1 ring-brass/40">
            {lead.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <h1 className="font-display text-4xl">{lead.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-parchment/70">
              <span>{lead.eventType}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {lead.eventDate ? formatDate(lead.eventDate) : "—"}</span>
              <span className="flex items-center gap-1.5"><Users size={14} /> {lead.guestCount} guests</span>
              <PriorityBadge priority={lead.stage === "booked" ? "booked" : lead.priority} />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(true)} className="btn btn-light !py-2.5 !text-xs"><Pencil size={14} /> Edit</button>
          <a href={`mailto:${lead.email}`} className="btn btn-light !py-2.5 !text-xs"><Mail size={14} /> Email</a>
          <a href={`tel:${lead.phone}`} className="btn btn-light !py-2.5 !text-xs"><Phone size={14} /> Call</a>
          {micrositeSlug ? (
            <Link href={`/celebration/${micrositeSlug}`} target="_blank" className="btn bg-parchment text-ink !py-2.5 !text-xs"><ExternalLink size={14} /> View Guest Microsite</Link>
          ) : (
            <Link href="/dashboard/marketing" className="btn bg-brass text-ink !py-2.5 !text-xs"><Sparkles size={14} /> Generate Guest Microsite</Link>
          )}
        </div>
      </div>

      {editing && <EditModal lead={lead} onClose={() => setEditing(false)} onSave={save} />}
    </div>
  );
}

export function EditableNotes({ id, initial }: { id: string; initial: string }) {
  const [notes, setNotes] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);

  useEffect(() => {
    const o = getContactOverrides()[id];
    if (o && typeof o.aiSummary === "string") { setNotes(o.aiSummary); setDraft(o.aiSummary); }
  }, [id]);

  function save() {
    setContactOverride(id, { aiSummary: draft });
    syncToApi("/api/contacts", "PATCH", { id, aiSummary: draft });
    setNotes(draft);
    setEditing(false);
  }

  return (
    <Panel title="Notes & AI summary" action={
      !editing ? <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-sm text-brass hover:underline"><Pencil size={13} /> Edit</button> : null
    }>
      {editing ? (
        <div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} className="w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-sm outline-none focus:border-sage" />
          <div className="mt-3 flex gap-2">
            <button onClick={save} className="btn btn-primary !py-2 !px-4 !text-xs"><Check size={14} /> Save</button>
            <button onClick={() => { setDraft(notes); setEditing(false); }} className="btn btn-ghost !py-2 !px-4 !text-xs">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 rounded-xl bg-brass/8 p-4">
          <StickyNote size={18} className="mt-0.5 shrink-0 text-brass" />
          <p className="text-sm leading-relaxed text-ink-soft">{notes || "No notes yet — click Edit to add some."}</p>
        </div>
      )}
    </Panel>
  );
}

function EditModal({ lead, onClose, onSave }: { lead: Lead; onClose: () => void; onSave: (l: Lead) => void }) {
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      ...lead,
      name: String(fd.get("name") || lead.name),
      email: String(fd.get("email") || lead.email),
      phone: String(fd.get("phone") || lead.phone),
      eventType: String(fd.get("eventType") || lead.eventType),
      eventDate: String(fd.get("eventDate") || lead.eventDate),
      guestCount: Number(fd.get("guestCount")) || lead.guestCount,
      stage: String(fd.get("stage") || lead.stage) as Lead["stage"],
    });
  }
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 text-ink backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-parchment p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">Edit contact</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <D name="name" label="Name*" def={lead.name} required />
          <D name="email" label="Email" type="email" def={lead.email} />
          <D name="phone" label="Phone" def={lead.phone} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-stone">Event type</label>
            <select name="eventType" defaultValue={lead.eventType} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage">
              {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <D name="eventDate" label="Event date" type="date" def={lead.eventDate} />
          <D name="guestCount" label="Guests" type="number" def={String(lead.guestCount)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-stone">Stage</label>
            <select name="stage" defaultValue={lead.stage} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 capitalize outline-none focus:border-sage">
              {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
          <div className="col-span-full flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1 !py-2.5"><Check size={15} /> Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function D({ name, label, type = "text", def, required }: { name: string; label: string; type?: string; def?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <input name={name} type={type} defaultValue={def} required={required} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage" />
    </div>
  );
}
