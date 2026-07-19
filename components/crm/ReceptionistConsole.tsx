"use client";

import { useState } from "react";
import { Send, Loader2, Bot, Phone, Sparkles } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function ReceptionistTester() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm Rosie 🌾 Test me here exactly as a caller or website visitor would. Try 'Is June 2027 open?'" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim() || busy) return;
    const next = [...messages, { role: "user" as const, content: input }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/receptionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[440px] flex-col rounded-2xl bg-parchment shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3 border-b border-ink/8 px-5 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-ink"><Bot size={18} className="text-brass-soft" /></div>
        <div>
          <p className="font-medium text-ink">Live test — Rosie</p>
          <p className="text-xs text-sage-deep">● Connected</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-bone px-4 py-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "rounded-br-sm bg-ink text-parchment" : "rounded-bl-sm bg-white text-ink shadow-sm"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {busy && <div className="flex gap-1 px-2"><Loader2 size={16} className="animate-spin text-stone" /></div>}
      </div>
      <div className="flex items-center gap-2 border-t border-ink/8 p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a test message…"
          className="flex-1 bg-transparent px-2 text-sm outline-none"
        />
        <button onClick={send} disabled={busy} aria-label="Send message" className="grid h-9 w-9 place-items-center rounded-full bg-ink text-parchment disabled:opacity-40"><Send size={16} /></button>
      </div>
    </div>
  );
}

export function ReceptionistConfig() {
  const [voice, setVoice] = useState("Warm & Friendly");
  const [afterHours, setAfterHours] = useState(true);
  const [captureLeads, setCaptureLeads] = useState(true);
  const [transferHot, setTransferHot] = useState(true);

  return (
    <div className="rounded-2xl bg-parchment p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2 text-brass"><Sparkles size={18} /><span className="text-xs font-semibold uppercase tracking-widest">Configuration</span></div>
      <h3 className="mt-3 font-display text-2xl text-ink">How Rosie answers</h3>

      <label className="mt-5 block text-xs font-medium uppercase tracking-wider text-stone">Persona / voice</label>
      <select value={voice} onChange={(e) => setVoice(e.target.value)} className="mt-1.5 w-full rounded-xl border border-ink/15 bg-bone px-4 py-3 text-ink outline-none focus:border-sage">
        {["Warm & Friendly", "Polished & Professional", "Playful & Casual"].map((v) => <option key={v}>{v}</option>)}
      </select>

      <div className="mt-5 space-y-3">
        <Toggle label="Answer after-hours & weekends (24/7)" on={afterHours} set={setAfterHours} />
        <Toggle label="Capture name, date & contact into CRM" on={captureLeads} set={setCaptureLeads} />
        <Toggle label="Text me instantly when a hot lead calls" on={transferHot} set={setTransferHot} />
      </div>

      <div className="mt-6 rounded-xl border border-ink/10 bg-bone p-4 text-sm text-ink-soft">
        <p className="font-medium text-ink">Phone line (pluggable)</p>
        <p className="mt-1">Connect a Twilio number in <span className="font-medium">Integrations</span> to let callers speak with Rosie by phone. Until then, the web chat is fully live.</p>
      </div>
    </div>
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className="flex w-full items-center justify-between rounded-xl bg-bone px-4 py-3 text-left text-sm text-ink-soft">
      {label}
      <span className={`relative h-6 w-11 rounded-full transition ${on ? "bg-sage-deep" : "bg-ink/20"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}
