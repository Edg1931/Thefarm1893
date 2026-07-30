"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { PortalMessage, PortalSender } from "@/lib/crm/portal";
import { getLocalPortalMessages, addLocalPortalMessage, syncToApi, newId } from "@/lib/crm/store";

/**
 * Threaded messaging between the couple and the venue (and vendors). Optimistic:
 * appends locally + persists via /api/portal/messages (a no-op in demo mode, so
 * we also stash sent messages in the browser so they survive a reload).
 */
export function PortalInbox({ leadId, initial, as = "couple", live = false }: { leadId: string; initial: PortalMessage[]; as?: PortalSender; live?: boolean }) {
  const [messages, setMessages] = useState<PortalMessage[]>(() => {
    if (live) return initial;
    const local = getLocalPortalMessages(leadId).map((m) => ({ id: m.id, leadId, sender: m.sender as PortalSender, body: m.body, createdAt: m.createdAt }));
    return [...initial, ...local];
  });
  const [draft, setDraft] = useState("");

  function send() {
    const body = draft.trim();
    if (!body) return;
    const msg: PortalMessage = { id: newId("MSG"), leadId, sender: as, body, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    setDraft("");
    if (!live) addLocalPortalMessage(leadId, { id: msg.id, sender: as, body, createdAt: msg.createdAt });
    syncToApi("/api/portal/messages", "POST", { leadId, sender: as, body });
  }

  const mine = as;
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-stone">No messages yet — say hello!</p>}
        {messages.map((m) => {
          const own = m.sender === mine;
          return (
            <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${own ? "bg-brass text-ink" : "bg-bone text-ink-soft"}`}>
                <p className="mb-0.5 text-[0.62rem] font-semibold uppercase tracking-wider opacity-60">{m.sender}</p>
                <p className="leading-relaxed">{m.body}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 border-t border-ink/8 pt-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Write a message…"
          className="flex-1 rounded-xl border border-ink/10 bg-bone px-4 py-2.5 text-sm text-ink outline-none focus:border-brass"
        />
        <button onClick={send} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-parchment transition hover:bg-ink/90"><Send size={16} /></button>
      </div>
    </div>
  );
}
