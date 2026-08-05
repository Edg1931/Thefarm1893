"use client";

import { useState } from "react";
import { CalendarClock as CalendarSync, Link2, Check, Download } from "lucide-react";
import { Panel } from "@/components/crm/widgets";

const providers = [
  { key: "google", label: "Google Calendar", method: "OAuth" },
  { key: "outlook", label: "Outlook", method: "OAuth" },
  { key: "apple", label: "Apple Calendar", method: "iCal" },
  { key: "airbnb", label: "Airbnb", method: "iCal" },
  { key: "vrbo", label: "VRBO", method: "iCal" },
];

export function CalendarConnect() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("venue");
  const [result, setResult] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function importFeed() {
    if (!url.trim()) return;
    setBusy(true); setResult(null);
    try {
      const res = await fetch("/api/integrations/ical", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: url.trim(), resourceSlug: slug }) });
      const data = await res.json();
      setResult(data.persisted ? `Imported ${data.imported} blocked ranges.` : `Preview: found ${data.imported ?? 0} ranges (connect Supabase to save).`);
    } catch { setResult("Could not import that feed."); }
    finally { setBusy(false); }
  }

  return (
    <Panel title={<span className="flex items-center gap-2"><CalendarSync size={16} className="text-brass" /> External calendars & OTA sync</span>}>
      <p className="text-sm text-ink-soft">Two-way sync keeps weddings and silo stays from ever double-booking. Google/Outlook connect by sign-in; Apple, Airbnb, and VRBO sync via iCal.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <a key={p.key} href={p.method === "OAuth" ? `/api/integrations/calendar/start?provider=${p.key}` : "#ical-import"}
            className="flex items-center justify-between rounded-xl border border-ink/8 bg-bone p-3 text-sm hover:border-brass/40">
            <span className="text-ink">{p.label}</span>
            <span className="flex items-center gap-1 text-xs text-stone"><Link2 size={12} /> {p.method}</span>
          </a>
        ))}
        <a href="/api/calendar/ical" className="flex items-center justify-between rounded-xl border border-sage/30 bg-sage/8 p-3 text-sm hover:border-sage/50">
          <span className="text-sage-deep">Our .ics feed</span>
          <span className="flex items-center gap-1 text-xs text-sage-deep"><Download size={12} /> Subscribe</span>
        </a>
      </div>

      <div id="ical-import" className="mt-5 rounded-xl bg-bone p-4">
        <p className="text-sm font-medium text-ink">Import an iCal feed (Airbnb / VRBO / Google)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/calendar.ics" aria-label="iCal feed URL" className="min-w-[220px] flex-1 rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass" />
          <select value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Which resource this feed blocks" className="rounded-lg border border-ink/12 bg-parchment px-3 py-2 text-sm outline-none focus:border-brass">
            <option value="venue">Main venue</option>
            <option value="the-orchard-silo">Orchard Silo</option>
            <option value="the-harvest-silo">Harvest Silo</option>
            <option value="the-copper-silo">Copper Silo</option>
            <option value="the-meadow-silo">Meadow Silo</option>
          </select>
          <button onClick={importFeed} disabled={busy} className="btn btn-primary !py-2 !text-xs disabled:opacity-60">{busy ? "Importing…" : "Import"}</button>
        </div>
        {result && <p className="mt-2 flex items-center gap-1.5 text-xs text-sage-deep"><Check size={12} /> {result}</p>}
      </div>
    </Panel>
  );
}
