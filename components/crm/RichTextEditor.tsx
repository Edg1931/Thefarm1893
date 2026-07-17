"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List, Hash, Smile, Undo2, Eraser } from "lucide-react";

const EMOJIS = [
  "🌾", "🍎", "💐", "💍", "🥂", "🌿", "✨", "💛", "🔥", "🌅", "🥰", "💌",
  "📍", "📅", "🎉", "🥳", "🍂", "❄️", "🌸", "☀️", "🕯️", "🍷", "🎶", "💒",
  "👰", "🤵", "🎊", "💫", "🌻", "🍃", "🎂", "🌙", "⭐", "💕", "🏡", "🌳",
  "😍", "👏", "🙌", "📌",
];

export function RichTextEditor({
  value,
  onChange,
  charLimit,
}: {
  value: string;
  onChange: (text: string) => void;
  charLimit?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [count, setCount] = useState(0);
  const lastSeed = useRef<string>("");

  // Seed the editor when the incoming value changes from outside (e.g., AI regen).
  useEffect(() => {
    if (ref.current && value !== lastSeed.current && value !== ref.current.innerText) {
      ref.current.innerText = value;
      lastSeed.current = value;
      setCount(value.length);
    }
  }, [value]);

  function sync() {
    const text = ref.current?.innerText ?? "";
    setCount(text.length);
    onChange(text);
  }

  function exec(cmd: string) {
    ref.current?.focus();
    document.execCommand(cmd, false);
    sync();
  }
  function insert(text: string) {
    ref.current?.focus();
    document.execCommand("insertText", false, text);
    sync();
  }
  function clear() {
    if (ref.current) { ref.current.innerText = ""; lastSeed.current = ""; }
    sync();
  }

  const over = charLimit ? count > charLimit : false;

  return (
    <div className="rounded-xl border border-ink/15 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-ink/10 px-2 py-1.5">
        <Tool onClick={() => exec("bold")} label="Bold"><Bold size={15} /></Tool>
        <Tool onClick={() => exec("italic")} label="Italic"><Italic size={15} /></Tool>
        <Tool onClick={() => exec("underline")} label="Underline"><Underline size={15} /></Tool>
        <Tool onClick={() => exec("insertUnorderedList")} label="Bulleted list"><List size={15} /></Tool>
        <span className="mx-1 h-5 w-px bg-ink/10" />
        <Tool onClick={() => insert(" #TheFarm1893")} label="Insert hashtag"><Hash size={15} /></Tool>
        <div className="relative">
          <Tool onClick={() => setShowEmoji((s) => !s)} label="Emoji" active={showEmoji}><Smile size={15} /></Tool>
          {showEmoji && (
            <div className="absolute left-0 top-9 z-30 grid w-64 grid-cols-8 gap-0.5 rounded-xl border border-ink/10 bg-parchment p-2 shadow-xl">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => { insert(e); }} className="rounded-md p-1 text-lg transition hover:bg-linen">{e}</button>
              ))}
            </div>
          )}
        </div>
        <span className="mx-1 h-5 w-px bg-ink/10" />
        <Tool onClick={() => exec("undo")} label="Undo"><Undo2 size={15} /></Tool>
        <Tool onClick={clear} label="Clear"><Eraser size={15} /></Tool>
        {charLimit && (
          <span className={`ml-auto text-xs ${over ? "font-medium text-terracotta" : "text-stone"}`}>{count}/{charLimit}</span>
        )}
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={sync}
        onBlur={() => setShowEmoji(false)}
        className="min-h-[180px] whitespace-pre-wrap px-4 py-3 text-sm leading-relaxed text-ink outline-none [&_ul]:ml-5 [&_ul]:list-disc"
        aria-label="Post editor"
      />
    </div>
  );
}

function Tool({ children, onClick, label, active }: { children: React.ReactNode; onClick: () => void; label: string; active?: boolean }) {
  return (
    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={onClick} title={label} aria-label={label}
      className={`grid h-8 w-8 place-items-center rounded-lg transition ${active ? "bg-ink text-parchment" : "text-ink-soft hover:bg-bone"}`}>
      {children}
    </button>
  );
}
