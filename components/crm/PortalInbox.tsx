"use client";

import { useState } from "react";
import { Send, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import type { PortalMessage, PortalSender } from "@/lib/crm/portal";
import { getLocalPortalMessages, addLocalPortalMessage, newId } from "@/lib/crm/store";

/**
 * Threaded messaging between the couple and the venue (and vendors). Optimistic:
 * appends locally + persists via /api/portal/messages (a no-op in demo mode, so
 * we also stash sent messages in the browser so they survive a reload).
 */
export function PortalInbox({ leadId, initial, as = "couple", live = false, context }: {
  leadId: string; initial: PortalMessage[]; as?: PortalSender; live?: boolean;
  /** Booking context so staff AI drafts can reference date/package/balance. */
  context?: { clientName?: string; eventDate?: string; packageName?: string; balanceDue?: number };
}) {
  const [messages, setMessages] = useState<PortalMessage[]>(() => {
    if (live) return initial;
    const local = getLocalPortalMessages(leadId).map((m) => ({ id: m.id, leadId, sender: m.sender as PortalSender, body: m.body, createdAt: m.createdAt }));
    return [...initial, ...local];
  });
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    const msg: PortalMessage = { id: newId("MSG"), leadId, sender: as, body, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, msg]);
    setDraft("");
    setSending(true);
    if (!live) addLocalPortalMessage(leadId, { id: msg.id, sender: as, body, createdAt: msg.createdAt });
    try {
      const res = await fetch("/api/portal/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ leadId, sender: as, body }) });
      if (!res.ok) throw new Error("failed");
    } catch {
      setFailed((f) => new Set(f).add(msg.id)); // flag, don't pretend it sent
    } finally {
      setSending(false);
    }
  }

  const [drafting, setDrafting] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  /** Staff-only: draft a reply to the couple's latest message. */
  async function suggestReply() {
    if (drafting) return;
    const lastFromClient = [...messages].reverse().find((m) => m.sender !== "staff");
    if (!lastFromClient) { setAiNote("Nothing to reply to yet."); setTimeout(() => setAiNote(null), 3000); return; }
    setDrafting(true); setAiNote(null);
    try {
      const res = await fetch("/api/inbox/draft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: lastFromClient.body, channel: "portal", ...context }),
      });
      const data = await res.json();
      if (!res.ok || !data.draft) throw new Error();
      setDraft(data.draft);
      setAiNote(data.mocked ? "Drafted offline — add ANTHROPIC_API_KEY for live AI." : "Drafted by AI — edit before sending.");
      setTimeout(() => setAiNote(null), 6000);
    } catch {
      setAiNote("Couldn't draft a reply.");
      setTimeout(() => setAiNote(null), 4000);
    } finally { setDrafting(false); }
  }

  const mine = as;
  const time = (iso: string) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? "" : d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); };
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="py-8 text-center text-sm text-stone">No messages yet — say hello!</p>}
        {messages.map((m) => {
          const own = m.sender === mine;
          return (
            <div key={m.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${own ? "bg-brass text-ink" : "bg-bone text-ink-soft"}`}>
                <p className="mb-0.5 text-[0.62rem] font-semibold uppercase tracking-wider opacity-60">{m.sender}</p>
                <p className="leading-relaxed">{m.body}</p>
              </div>
              <p className={`mt-0.5 px-1 text-[0.6rem] ${failed.has(m.id) ? "text-terracotta" : "text-stone"}`}>
                {failed.has(m.id) ? <span className="inline-flex items-center gap-1"><AlertCircle size={10} /> Not delivered — try again</span> : time(m.createdAt)}
              </p>
            </div>
          );
        })}
      </div>
      {as === "staff" && (
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink/8 pt-4">
          <button onClick={suggestReply} disabled={drafting} className="inline-flex items-center gap-1.5 rounded-full bg-brass/12 px-3 py-1.5 text-xs font-medium text-brass ring-1 ring-brass/25 transition hover:bg-brass/20 disabled:opacity-60">
            {drafting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />} {drafting ? "Drafting…" : "AI suggest reply"}
          </button>
          {aiNote && <span className="truncate text-[0.68rem] text-stone">{aiNote}</span>}
        </div>
      )}
      <div className={`flex items-center gap-2 ${as === "staff" ? "mt-3" : "mt-4 border-t border-ink/8 pt-4"}`}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder="Write a message…"
          aria-label="Write a message"
          className="flex-1 rounded-xl border border-ink/10 bg-bone px-4 py-2.5 text-sm text-ink outline-none focus:border-brass"
        />
        <button onClick={send} disabled={sending || !draft.trim()} aria-label="Send" className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-parchment transition hover:bg-ink/90 disabled:opacity-40"><Send size={16} /></button>
      </div>
    </div>
  );
}
