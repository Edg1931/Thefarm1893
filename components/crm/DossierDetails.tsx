"use client";

import { useEffect, useState } from "react";
import { Pencil, Check, X, CalendarClock, Palette, UtensilsCrossed, Truck, Phone } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import { type DossierDetails as Details } from "@/lib/crm/bookings";
import { getDossierOverride, setDossierOverride, syncToApi } from "@/lib/crm/store";

const GROUPS: { title: string; icon: typeof CalendarClock; fields: [string, string][] }[] = [
  {
    title: "Event timeline", icon: CalendarClock,
    fields: [
      ["ceremonyTime", "Ceremony"], ["cocktailHour", "Cocktail hour"], ["receptionStart", "Reception start"], ["lastDance", "Last dance / end"],
      ["ceremonyLocation", "Ceremony location"], ["receptionLocation", "Reception location"], ["gettingReady", "Getting ready"], ["finalGuestCount", "Final guest count"],
    ],
  },
  {
    title: "Style & design", icon: Palette,
    fields: [["style", "Style / vibe"], ["colors", "Color palette"], ["rainPlan", "Rain plan"]],
  },
  {
    title: "Catering & bar", icon: UtensilsCrossed,
    fields: [["cateringCount", "Catering headcount"], ["menuStyle", "Menu / service"], ["dietary", "Dietary & allergies"], ["barPackage", "Bar package"], ["cake", "Cake & dessert"]],
  },
  {
    title: "Day-of logistics", icon: Truck,
    fields: [["loadIn", "Vendor load-in"], ["parking", "Parking / shuttle"], ["musicEndsAt", "Music ends / noise"], ["petsKids", "Pets & kids"], ["accessibility", "Accessibility"], ["specialRequests", "Special requests"]],
  },
  {
    title: "Key contacts", icon: Phone,
    fields: [["primaryContact", "Primary contact"], ["emergencyContact", "Emergency contact"]],
  },
];

export function DossierDetails({ leadId, initial, live = false }: { leadId: string; initial: Details; live?: boolean }) {
  const [details, setDetails] = useState<Details>(initial);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Details>(initial);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (live) { setDetails(initial); return; }
    const o = getDossierOverride(leadId)?.details;
    if (o) { setDetails(o); }
  }, [leadId, live, initial]);

  function startEdit() { setDraft({ ...details }); setEditing(true); }
  function save() {
    const clean = draft;
    setDetails(clean);
    if (!live) setDossierOverride(leadId, { details: clean });
    syncToApi("/api/dossier", "PATCH", { leadId, details: clean });
    setEditing(false);
    setToast("Event details saved.");
    setTimeout(() => setToast(""), 2200);
  }

  return (
    <Panel
      title="Event details & logistics"
      action={
        editing ? (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="btn btn-ghost !py-2 !px-3 !text-xs"><X size={13} /> Cancel</button>
            <button onClick={save} className="btn btn-primary !py-2 !px-3 !text-xs"><Check size={13} /> Save</button>
          </div>
        ) : (
          <button onClick={startEdit} className="flex items-center gap-1.5 text-sm text-brass hover:underline"><Pencil size={13} /> Edit</button>
        )
      }
    >
      <div className="grid gap-6 md:grid-cols-2">
        {GROUPS.map((g) => (
          <div key={g.title} className={g.title === "Event timeline" ? "md:col-span-2" : ""}>
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brass">
              <g.icon size={14} /> {g.title}
            </p>
            <div className={`grid gap-x-6 gap-y-3 ${g.title === "Event timeline" ? "sm:grid-cols-2 xl:grid-cols-4" : "sm:grid-cols-2"}`}>
              {g.fields.map(([key, label]) => (
                <div key={key} className="min-w-0">
                  <p className="text-[0.7rem] font-medium uppercase tracking-wider text-stone">{label}</p>
                  {editing ? (
                    <input
                      value={draft[key] ?? ""}
                      onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                      className="mt-1 w-full rounded-lg border border-ink/15 bg-bone px-3 py-2 text-sm outline-none focus:border-sage"
                    />
                  ) : (
                    <p className="mt-0.5 text-sm text-ink-soft">{details[key]?.trim() ? details[key] : <span className="text-stone/60">—</span>}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl bg-sage-deep px-5 py-3 text-sm text-parchment shadow-lg"><Check size={16} /> {toast}</div>
      )}
    </Panel>
  );
}
