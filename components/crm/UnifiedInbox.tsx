"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bot, Home, Building2, Send } from "lucide-react";
import { Panel } from "@/components/crm/widgets";
import type { Conversation, Channel } from "@/lib/crm/comms";

const channelMeta: Record<Channel, { icon: typeof Mail; label: string; tint: string }> = {
  email: { icon: Mail, label: "Email", tint: "text-sage-deep" },
  sms: { icon: MessageSquare, label: "SMS", tint: "text-brass" },
  web_chat: { icon: Bot, label: "Web chat", tint: "text-ink" },
  airbnb: { icon: Home, label: "Airbnb", tint: "text-terracotta" },
  vrbo: { icon: Building2, label: "VRBO", tint: "text-sage-deep" },
  facebook: { icon: MessageSquare, label: "Facebook", tint: "text-ink" },
};

export function UnifiedInbox({ initial }: { initial: Conversation[] }) {
  const [threads, setThreads] = useState(initial);
  const [activeId, setActiveId] = useState(initial[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const active = threads.find((t) => t.id === activeId) ?? null;

  function send() {
    if (!active || !draft.trim()) return;
    const body = draft.trim();
    setThreads((all) => all.map((t) => (t.id === active.id ? { ...t, unread: false, messages: [...t.messages, { role: "outbound", body, at: new Date().toISOString() }] } : t)));
    setDraft("");
    fetch("/api/inbox", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId: active.id, body }) }).catch(() => {});
  }
  function open(id: string) {
    setActiveId(id);
    setThreads((all) => all.map((t) => (t.id === id ? { ...t, unread: false } : t)));
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <Panel title="Conversations" className="!p-0 overflow-hidden">
        <ul className="max-h-[520px] divide-y divide-ink/6 overflow-y-auto">
          {threads.map((t) => {
            const m = channelMeta[t.channel];
            const Icon = m.icon;
            return (
              <li key={t.id}>
                <button onClick={() => open(t.id)} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-bone/60 ${t.id === activeId ? "bg-bone" : ""}`}>
                  <span className={`mt-0.5 ${m.tint}`}><Icon size={16} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between">
                      <span className={`truncate text-sm ${t.unread ? "font-semibold text-ink" : "font-medium text-ink-soft"}`}>{t.name}</span>
                      {t.unread && <span className="ml-2 h-2 w-2 shrink-0 rounded-full bg-brass" />}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-stone">{m.label} · {t.preview || t.messages[t.messages.length - 1]?.body}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title={active ? active.name : "Select a conversation"}>
        {active ? (
          <div className="flex h-full min-h-[440px] flex-col">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {active.messages.map((msg, i) => {
                const own = msg.role !== "inbound";
                return (
                  <div key={i} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "ai" ? "bg-sage/15 text-sage-deep" : own ? "bg-brass text-ink" : "bg-bone text-ink-soft"}`}>
                      {msg.role === "ai" && <p className="mb-0.5 text-[0.6rem] font-semibold uppercase tracking-wider opacity-60">Rosie AI</p>}
                      {msg.body}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-ink/8 pt-4">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder={`Reply on ${channelMeta[active.channel].label}…`} className="flex-1 rounded-xl border border-ink/10 bg-bone px-4 py-2.5 text-sm outline-none focus:border-brass" />
              <button onClick={send} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-parchment hover:bg-ink/90"><Send size={16} /></button>
            </div>
          </div>
        ) : <p className="py-12 text-center text-sm text-stone">Pick a thread to reply.</p>}
      </Panel>
    </div>
  );
}
