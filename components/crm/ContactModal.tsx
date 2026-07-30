"use client";

import { useRef } from "react";
import { X, Check } from "lucide-react";
import { type Lead } from "@/lib/crm/sample-data";
import { newId } from "@/lib/crm/store";
import { useModalClose } from "@/lib/useModalClose";

export const EVENT_TYPES = ["Wedding", "Corporate Retreat", "Anniversary", "Bridal Shower", "Celebration of Life", "Other"];
export const STAGES: Lead["stage"][] = ["new", "toured", "proposal", "booked", "lost"];

/** Shared add/edit dialog for a contact/lead. Used by Contacts + the Pipeline board. */
export function ContactModal({
  contact, onClose, onSave, isNew,
}: {
  contact?: Lead; onClose: () => void; onSave: (l: Lead) => void; isNew?: boolean;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalClose(onClose, dialogRef);
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const base: Lead = contact ?? {
      id: newId("L"), name: "", email: "", phone: "", eventType: "Wedding", eventDate: "",
      guestCount: 0, budget: 0, stage: "new", score: 50, priority: "warm", source: "CRM", lastActivity: "just now", aiSummary: "",
    };
    const updated: Lead = {
      ...base,
      name: String(fd.get("name") || base.name),
      email: String(fd.get("email") || base.email),
      phone: String(fd.get("phone") || base.phone),
      eventType: String(fd.get("eventType") || base.eventType),
      eventDate: String(fd.get("eventDate") || base.eventDate),
      guestCount: Number(fd.get("guestCount")) || base.guestCount,
      budget: Number(fd.get("budget")) || base.budget,
      stage: String(fd.get("stage") || base.stage) as Lead["stage"],
      aiSummary: String(fd.get("aiSummary") || base.aiSummary),
    };
    onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-parchment p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl text-ink">{isNew ? "New contact" : `Edit ${contact?.name}`}</h2>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <F name="name" label="Name*" def={contact?.name} required />
            <F name="email" label="Email" type="email" def={contact?.email} />
            <F name="phone" label="Phone" def={contact?.phone} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Event type</label>
              <select name="eventType" defaultValue={contact?.eventType ?? "Wedding"} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage">
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <F name="eventDate" label="Event date" type="date" def={contact?.eventDate} />
            <F name="guestCount" label="Guests" type="number" def={contact?.guestCount ? String(contact.guestCount) : ""} />
            <F name="budget" label="Est. value ($)" type="number" def={contact?.budget ? String(contact.budget) : ""} />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-stone">Stage</label>
              <select name="stage" defaultValue={contact?.stage ?? "new"} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 capitalize outline-none focus:border-sage">
                {STAGES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wider text-stone">Notes</label>
            <textarea name="aiSummary" rows={3} defaultValue={contact?.aiSummary} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 !py-2.5">Cancel</button>
            <button type="submit" className="btn btn-primary flex-1 !py-2.5"><Check size={15} /> {isNew ? "Add Contact" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function F({ name, label, type = "text", def, required }: { name: string; label: string; type?: string; def?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-wider text-stone">{label}</label>
      <input name={name} type={type} defaultValue={def} required={required} className="rounded-xl border border-ink/15 bg-bone px-4 py-3 outline-none focus:border-sage" />
    </div>
  );
}
