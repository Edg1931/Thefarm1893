"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Phone, Sparkles } from "lucide-react";
import { business } from "@/lib/content";
import { PhoneLink } from "./PhoneLink";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi there! I'm Rosie, the AI concierge for The Farm 1893 🌾 I'm here 24/7. I can check a date, share pricing, or help you plan your visit. What day are you dreaming about?",
};

const QUICK = [
  "Is October 2026 available?",
  "What's included in the weekend package?",
  "How many guests can you host?",
];

export function ReceptionistWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pulse, setPulse] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Move focus into the chat on open; close on Escape.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); document.removeEventListener("keydown", onKey); };
  }, [open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setPulse(false);
    const next = [...messages, { role: "user" as const, content }];
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
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I'm having a little trouble connecting — but I'd love to help! Call us anytime at " +
            business.phone + " or leave your email and we'll reach out.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-[70] grid h-16 w-16 place-items-center rounded-full bg-[color:var(--color-ink)] text-parchment shadow-[0_20px_50px_-15px_rgba(28,26,23,0.7)] transition hover:scale-105"
        aria-label="Chat with our AI concierge"
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
        {pulse && !open && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-terracotta opacity-75" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-terracotta" />
          </span>
        )}
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Rosie — AI concierge chat"
        aria-hidden={!open}
        inert={!open || undefined}
        className={`fixed bottom-24 right-5 z-[70] flex w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl bg-parchment shadow-[0_40px_90px_-30px_rgba(28,26,23,0.6)] transition-all duration-300 ${
          open ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ height: "min(560px, 72vh)" }}
      >
        {/* Header */}
        <div className="bg-[color:var(--color-ink)] px-5 py-4 text-parchment">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brass/20 ring-1 ring-brass/40">
              <Sparkles size={20} className="text-brass-soft" />
            </div>
            <div className="flex-1">
              <p className="font-display text-xl leading-none">Rosie</p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-parchment/60">
                <span className="inline-block h-2 w-2 rounded-full bg-sage" /> AI Concierge · online 24/7
              </p>
            </div>
            <PhoneLink className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Call us">
              <Phone size={16} />
            </PhoneLink>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-bone px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "rounded-br-sm bg-[color:var(--color-ink)] text-parchment"
                    : "rounded-bl-sm bg-white text-ink shadow-sm"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-stone [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-stone [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-stone" />
              </div>
            </div>
          )}
          {messages.length <= 1 && (
            <div className="space-y-2 pt-1">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="block w-full rounded-full border border-ink/15 bg-white/60 px-4 py-2 text-left text-xs text-ink-soft transition hover:border-ink/40 hover:bg-white"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-ink/10 bg-parchment px-3 py-3"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about dates, pricing, tours…"
            aria-label="Ask Rosie a question"
            className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-stone"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--color-ink)] text-parchment transition disabled:opacity-40"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
