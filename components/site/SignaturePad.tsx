"use client";

import { useRef, useState, useEffect } from "react";
import { Check, Eraser, Loader2 } from "lucide-react";

/**
 * Native e-signature capture: draw on the canvas (or it falls back to a typed
 * name), then submit to /api/contracts/sign with the token. On success shows a
 * confirmation with the audit stamp.
 */
export function SignaturePad({ token }: { token: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.2; ctx.lineCap = "round"; ctx.strokeStyle = "#2b2320";
  }, []);

  function pos(e: React.PointerEvent) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) };
  }
  function down(e: React.PointerEvent) { drawing.current = true; const ctx = canvasRef.current!.getContext("2d")!; const p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
  function move(e: React.PointerEvent) { if (!drawing.current) return; const ctx = canvasRef.current!.getContext("2d")!; const p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); hasDrawn.current = true; }
  function up() { drawing.current = false; }
  function clear() { const c = canvasRef.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); hasDrawn.current = false; }

  async function submit() {
    if (!name.trim()) { setMsg("Please type your full legal name."); setState("error"); return; }
    setState("busy"); setMsg("");
    const signatureData = hasDrawn.current ? canvasRef.current!.toDataURL("image/png") : "";
    try {
      const res = await fetch("/api/contracts/sign", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signerName: name.trim(), signatureData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not sign.");
      setState("done");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Something went wrong."); setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl bg-sage/12 p-8 text-center ring-1 ring-sage/25">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-sage/20"><Check className="text-sage-deep" size={28} /></div>
        <h3 className="mt-4 font-display text-2xl text-ink">Signed — thank you, {name}!</h3>
        <p className="mt-2 text-sm text-stone">A copy is on its way to your inbox. We can&apos;t wait to celebrate with you.</p>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-ink">Full legal name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" className="mb-4 w-full rounded-xl border border-ink/12 bg-bone px-4 py-3 text-ink outline-none focus:border-brass" />
      <label className="mb-2 block text-sm font-medium text-ink">Draw your signature</label>
      <div className="relative rounded-xl border border-ink/15 bg-parchment">
        <canvas ref={canvasRef} width={560} height={180} className="h-[180px] w-full touch-none rounded-xl"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />
        <button onClick={clear} type="button" className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-bone px-2 py-1 text-xs text-stone hover:text-ink"><Eraser size={12} /> Clear</button>
      </div>
      {state === "error" && <p className="mt-3 text-sm text-terracotta">{msg}</p>}
      <button onClick={submit} disabled={state === "busy"} className="btn btn-primary mt-5 w-full disabled:opacity-60">
        {state === "busy" ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Adopt &amp; sign
      </button>
      <p className="mt-3 text-center text-xs text-stone">By signing you agree this electronic signature is legally binding.</p>
    </div>
  );
}
