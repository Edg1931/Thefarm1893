"use client";

import { useState } from "react";
import { Instagram, Mail, Megaphone, FileText, Sparkles, Loader2, Copy, Check, CalendarPlus } from "lucide-react";

const KINDS = [
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "email", label: "Email", icon: Mail },
  { key: "ad", label: "Paid Ad", icon: Megaphone },
  { key: "blog", label: "Blog", icon: FileText },
] as const;

const IDEAS = [
  "a golden-hour summer orchard wedding",
  "why an all-inclusive weekend venue beats a one-day rental",
  "last-minute open Saturdays in the barn",
  "corporate fall retreats on the farm",
];

const scheduled = [
  { when: "Today · 6:00 PM", platform: "Instagram", text: "Golden hour in the orchard 🌾 3 Saturdays left for 2026…", status: "Scheduled" },
  { when: "Thu · 10:00 AM", platform: "Facebook", text: "Meet the farmhouse — where 25 of your people stay all weekend.", status: "Scheduled" },
  { when: "Sat · 9:00 AM", platform: "Email", text: "Newsletter: 'A Weekend at The Farm' — 1,240 subscribers", status: "Draft" },
];

export function MarketingStudio() {
  const [kind, setKind] = useState<(typeof KINDS)[number]["key"]>("instagram");
  const [topic, setTopic] = useState(IDEAS[0]);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [mocked, setMocked] = useState(false);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setOutput("");
    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, topic }),
      });
      const data = await res.json();
      setOutput(data.content ?? "");
      setMocked(Boolean(data.mocked));
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
      {/* Generator */}
      <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2 text-brass">
          <Sparkles size={18} />
          <span className="text-xs font-semibold uppercase tracking-widest">AI Content Generator</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.key}
              onClick={() => setKind(k.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm transition ${
                kind === k.key ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"
              }`}
            >
              <k.icon size={15} /> {k.label}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-xs font-medium uppercase tracking-wider text-stone">Topic / angle</label>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {IDEAS.map((idea) => (
            <button key={idea} onClick={() => setTopic(idea)} className="rounded-full border border-ink/10 bg-white px-3 py-1 text-[0.7rem] text-stone hover:border-sage hover:text-ink">
              {idea}
            </button>
          ))}
        </div>

        <button onClick={generate} disabled={loading} className="btn btn-primary mt-5 w-full disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          Generate Content
        </button>

        {output && (
          <div className="animate-rise mt-5 rounded-xl border border-ink/10 bg-bone p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-stone">
                {mocked ? "Preview (add ANTHROPIC_API_KEY to go live)" : "AI-generated"}
              </span>
              <button onClick={copy} className="flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
                {copied ? <Check size={14} className="text-sage" /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink-soft">{output}</pre>
            <button className="btn btn-ghost mt-4 !py-2 !text-xs"><CalendarPlus size={14} /> Schedule this post</button>
          </div>
        )}
      </div>

      {/* Scheduler */}
      <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
        <h3 className="font-display text-2xl text-ink">Content calendar</h3>
        <p className="text-sm text-stone">Queued across your channels</p>
        <ul className="mt-5 space-y-3">
          {scheduled.map((s) => (
            <li key={s.text} className="rounded-xl bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-brass">{s.platform}</span>
                <span className={`rounded-full px-2 py-0.5 text-[0.62rem] ${s.status === "Scheduled" ? "bg-sage/15 text-sage-deep" : "bg-ink/8 text-ink-soft"}`}>{s.status}</span>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{s.text}</p>
              <p className="mt-1.5 text-xs text-stone">{s.when}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl border border-brass/30 bg-brass/8 p-4 text-sm text-ink-soft">
          <span className="font-medium text-ink">AI suggests:</span> Post 4× this week to stay in the algorithm. Best window for your audience: <span className="font-medium text-ink">Tue–Thu, 6–8 PM.</span>
        </div>
      </div>
    </div>
  );
}
