"use client";

import { useState } from "react";
import {
  Instagram, Facebook, Image as ImageIcon, Music2, Twitter, Linkedin,
  Search, Mail, MessageSquare, Sparkles, Loader2, CalendarPlus, Rocket,
  Check, Users, Target, Palette, Plug, type LucideIcon,
} from "lucide-react";
import { RichTextEditor } from "@/components/crm/RichTextEditor";

type Channel = { key: string; label: string; icon: LucideIcon; limit?: number; paid?: boolean };

const CHANNELS: Channel[] = [
  { key: "instagram", label: "Instagram", icon: Instagram, limit: 2200, paid: true },
  { key: "facebook", label: "Facebook", icon: Facebook, limit: 2200, paid: true },
  { key: "pinterest", label: "Pinterest", icon: ImageIcon, limit: 500 },
  { key: "tiktok", label: "TikTok", icon: Music2, limit: 2200, paid: true },
  { key: "x", label: "X", icon: Twitter, limit: 280 },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, limit: 3000 },
  { key: "google-ads", label: "Google Ads", icon: Search, paid: true },
  { key: "email", label: "Email", icon: Mail },
  { key: "sms", label: "SMS", icon: MessageSquare, limit: 160 },
];

const PROFILES = [
  { key: "budget-couple", label: "Budget-savvy couple" },
  { key: "luxury-couple", label: "Luxury couple" },
  { key: "destination-couple", label: "Weekend / out-of-town couple" },
  { key: "corporate", label: "Corporate / retreat planner" },
  { key: "milestone", label: "Milestone celebration" },
  { key: "silo-guest", label: "Silo getaway guest (VRBO)" },
];
const GOALS = [
  { key: "tour", label: "Book a tour" },
  { key: "inquiry", label: "Drive inquiries" },
  { key: "fill-date", label: "Fill an open date" },
  { key: "awareness", label: "Brand awareness" },
  { key: "silos", label: "Promote silo stays" },
];
const TONES = ["Warm & rustic-luxe", "Fun & playful", "Elevated & luxurious", "Cozy & down-to-earth", "Urgent & scarcity"];

const DEFAULT_CONNECTED = new Set(["instagram", "facebook", "email"]);

export function AdStudio() {
  const [connected, setConnected] = useState<Set<string>>(new Set(DEFAULT_CONNECTED));
  const [channel, setChannel] = useState("instagram");
  const [profile, setProfile] = useState("destination-couple");
  const [goal, setGoal] = useState("tour");
  const [tone, setTone] = useState(TONES[0]);
  const [topic, setTopic] = useState("a golden-hour orchard wedding weekend");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [edited, setEdited] = useState("");
  const [mocked, setMocked] = useState(false);
  const [boost, setBoost] = useState(false);
  const [budget, setBudget] = useState(150);
  const [when, setWhen] = useState("");
  const [queue, setQueue] = useState([
    { platform: "Instagram", text: "Golden hour in the orchard 🌾 A few 2026 weekends left…", when: "Today · 6:00 PM", status: "Scheduled" },
    { platform: "Facebook", text: "Meet the farmhouse — where 25 of your people stay all weekend.", when: "Thu · 10:00 AM", status: "Scheduled" },
  ]);
  const [toast, setToast] = useState("");

  const current = CHANNELS.find((c) => c.key === channel)!;
  const isPaid = Boolean(current.paid);

  async function generate() {
    setLoading(true);
    setDraft("");
    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, topic, profile, goal, tone }),
      });
      const data = await res.json();
      setDraft(data.content ?? "");
      setEdited(data.content ?? "");
      setMocked(Boolean(data.mocked));
    } finally {
      setLoading(false);
    }
  }

  function schedule(launch: boolean) {
    if (!edited.trim()) return;
    setQueue((q) => [{
      platform: current.label,
      text: edited.slice(0, 90),
      when: when ? new Date(when).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }) : "Queued",
      status: launch ? (isPaid ? "Live ad" : "Published") : "Scheduled",
    }, ...q]);
    setToast(launch ? (isPaid ? `Ad launched to ${current.label} 🚀` : `Published to ${current.label} ✓`) : `Scheduled to ${current.label} ✓`);
    setTimeout(() => setToast(""), 2600);
  }

  function toggleConnect(key: string) {
    setConnected((s) => {
      const n = new Set(s);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  }

  return (
    <div className="space-y-6">
      {/* Channel integrations */}
      <div className="rounded-2xl bg-parchment p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-brass"><Plug size={16} /><span className="text-xs font-semibold uppercase tracking-widest">Connected channels</span></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CHANNELS.map((c) => {
            const on = connected.has(c.key);
            return (
              <button key={c.key} onClick={() => toggleConnect(c.key)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${on ? "border-sage/40 bg-sage/10 text-sage-deep" : "border-ink/15 bg-white text-stone hover:border-ink/40"}`}>
                <c.icon size={14} /> {c.label}
                {on ? <Check size={12} /> : <span className="text-[0.6rem] uppercase tracking-wide text-brass">Connect</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-stone">Connect your accounts to publish and run ads directly. (OAuth activates with your Meta / Google / TikTok keys.)</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Composer */}
        <div className="space-y-6">
          {/* Generator */}
          <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 text-brass"><Sparkles size={18} /><span className="text-xs font-semibold uppercase tracking-widest">AI Ad Generator</span></div>

            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-stone">Channel</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {CHANNELS.map((c) => (
                <button key={c.key} onClick={() => setChannel(c.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${channel === c.key ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>
                  <c.icon size={13} /> {c.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <Select label="Audience profile" icon={Users} value={profile} onChange={setProfile} options={PROFILES} />
              <Select label="Goal" icon={Target} value={goal} onChange={setGoal} options={GOALS} />
              <Select label="Tone" icon={Palette} value={tone} onChange={setTone} options={TONES.map((t) => ({ key: t, label: t }))} />
            </div>

            <label className="mt-4 block text-xs font-medium uppercase tracking-wider text-stone">Topic / angle</label>
            <input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-sm text-ink outline-none focus:border-sage" />

            <button onClick={generate} disabled={loading} className="btn btn-primary mt-5 w-full disabled:opacity-60">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {draft ? "Regenerate" : "Generate with AI"}
            </button>
          </div>

          {/* Editor + publish */}
          <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-2xl text-ink">Edit &amp; polish</h3>
              {draft && <span className="text-xs text-stone">{mocked ? "AI preview (add key to go live)" : "AI-generated"}</span>}
            </div>
            <RichTextEditor value={draft} onChange={setEdited} charLimit={current.limit} />

            {/* Publish controls */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs uppercase tracking-wider text-stone">Schedule
                <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-lg border border-ink/15 bg-bone px-3 py-2 text-sm text-ink outline-none focus:border-sage" />
              </label>
              {(isPaid) && (
                <div>
                  <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone">
                    <input type="checkbox" checked={boost} onChange={(e) => setBoost(e.target.checked)} /> Run as paid ad
                  </label>
                  {boost && (
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-sm text-stone">$</span>
                      <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-24 rounded-lg border border-ink/15 bg-bone px-3 py-2 text-sm text-ink outline-none focus:border-sage" />
                      <span className="text-xs text-stone">budget</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => schedule(false)} disabled={!edited.trim()} className="btn btn-ghost !py-2.5 disabled:opacity-50"><CalendarPlus size={15} /> Schedule</button>
              <button onClick={() => schedule(true)} disabled={!edited.trim()} className="btn btn-primary !py-2.5 disabled:opacity-50">
                {boost && isPaid ? <><Rocket size={15} /> Launch Ad{boost ? ` · $${budget}` : ""}</> : <><Check size={15} /> Publish Now</>}
              </button>
            </div>
          </div>
        </div>

        {/* Right: preview + calendar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
            <h3 className="mb-3 font-display text-2xl text-ink">Live preview</h3>
            <Preview channel={current} text={edited || draft} paid={boost && isPaid} />
          </div>

          <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
            <h3 className="font-display text-2xl text-ink">Content calendar</h3>
            <ul className="mt-4 space-y-3">
              {queue.map((s, i) => (
                <li key={i} className="rounded-xl bg-bone p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-brass">{s.platform}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] ${s.status === "Scheduled" ? "bg-sage/15 text-sage-deep" : s.status === "Live ad" ? "bg-terracotta/15 text-terracotta" : "bg-ink/8 text-ink-soft"}`}>{s.status}</span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{s.text}</p>
                  <p className="mt-1.5 text-xs text-stone">{s.when}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl bg-sage-deep px-5 py-3 text-sm text-parchment shadow-lg"><Check size={16} /> {toast}</div>}
    </div>
  );
}

function Select({ label, icon: Icon, value, onChange, options }: { label: string; icon: LucideIcon; value: string; onChange: (v: string) => void; options: { key: string; label: string }[] }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wider text-stone">
      <span className="flex items-center gap-1.5"><Icon size={12} /> {label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-ink/15 bg-bone px-3 py-2.5 text-sm normal-case text-ink outline-none focus:border-sage">
        {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Preview({ channel, text, paid }: { channel: Channel; text: string; paid: boolean }) {
  if (!text) {
    return <div className="grid min-h-[220px] place-items-center rounded-xl border border-dashed border-ink/20 bg-bone/50 p-6 text-center text-sm text-stone">Generate content to preview how it looks on {channel.label}.</div>;
  }
  return (
    <div className="overflow-hidden rounded-xl border border-ink/10 bg-white">
      <div className="flex items-center gap-2 border-b border-ink/8 px-4 py-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-sage-deep font-display text-sm text-parchment">F</span>
        <div className="leading-tight">
          <p className="text-sm font-medium text-ink">The Farm 1893</p>
          <p className="flex items-center gap-1 text-[0.65rem] text-stone"><channel.icon size={10} /> {paid ? "Sponsored" : channel.label}</p>
        </div>
      </div>
      {["instagram", "facebook", "pinterest", "tiktok"].includes(channel.key) && (
        <div className="aspect-[4/3] bg-gradient-to-br from-sage/30 to-brass/20" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=60)", backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      <p className="whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-ink-soft">{text}</p>
      {paid && <div className="border-t border-ink/8 px-4 py-2"><span className="rounded-md bg-ink px-3 py-1.5 text-xs font-medium text-parchment">Book a Tour</span></div>}
    </div>
  );
}
