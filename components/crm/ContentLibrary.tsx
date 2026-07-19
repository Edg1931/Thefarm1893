"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Copy, Check, X, Printer, Sparkles, FileText, Image as ImageIcon, Mail, SignpostBig, Layers,
} from "lucide-react";
import {
  contentTemplates, contentCategories, type ContentTemplate, type ContentCategory,
} from "@/lib/crm/content-templates";

const catIcon: Record<ContentCategory, typeof FileText> = {
  Print: FileText, Social: ImageIcon, Email: Mail, Signage: SignpostBig,
};

const themes = {
  orchard: { bg: "#e9ede2", ink: "#2b3a2b", accent: "#7c8768", sub: "#5b6b52" },
  ink: { bg: "#1c1a17", ink: "#f7f3ec", accent: "#cbb488", sub: "#c9c2b4" },
  brass: { bg: "#f3ead8", ink: "#3a2f1c", accent: "#b18f57", sub: "#7a6640" },
} as const;

export function ContentLibrary() {
  const [cat, setCat] = useState<ContentCategory | "All">("All");
  const [active, setActive] = useState<ContentTemplate | null>(null);
  const shown = cat === "All" ? contentTemplates : contentTemplates.filter((t) => t.category === cat);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brass"><Layers size={14} /> Content Library</p>
          <h1 className="mt-2 font-display text-4xl text-ink">Marketing collateral, ready to go</h1>
          <p className="mt-1 text-stone">Brochures, flyers, social graphics, and email templates — copy, print, or hand to the AI Studio to customize.</p>
        </div>
        <Link href="/dashboard/marketing" className="btn btn-primary !py-2.5 !text-xs"><Sparkles size={15} /> AI Marketing Studio</Link>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {(["All", ...contentCategories] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${cat === c ? "bg-ink text-parchment" : "bg-bone text-ink-soft hover:bg-linen"}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((t) => {
          const Icon = catIcon[t.category];
          return (
            <div key={t.id} className="flex flex-col overflow-hidden rounded-2xl bg-parchment shadow-[var(--shadow-soft)] ring-1 ring-ink/5">
              <button onClick={() => setActive(t)} className="block text-left">
                {t.format === "visual" && t.visual ? (
                  <VisualPreview t={t} thumb />
                ) : (
                  <div className="h-40 overflow-hidden bg-bone p-4">
                    <p className="line-clamp-6 whitespace-pre-line text-[0.7rem] leading-relaxed text-ink-soft">{t.body}</p>
                  </div>
                )}
              </button>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2 text-xs text-stone">
                  <Icon size={13} /> {t.category}{t.meta ? ` · ${t.meta}` : ""}
                </div>
                <h3 className="mt-1 font-display text-xl text-ink">{t.title}</h3>
                <p className="mt-1 flex-1 text-sm text-ink-soft">{t.description}</p>
                <button onClick={() => setActive(t)} className="mt-3 self-start text-sm font-medium text-brass hover:underline">
                  {t.format === "copy" ? "Preview & copy →" : "Preview & print →"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {active && <PreviewModal t={active} onClose={() => setActive(null)} />}
    </div>
  );
}

function VisualPreview({ t, thumb, large }: { t: ContentTemplate; thumb?: boolean; large?: boolean }) {
  const v = t.visual!;
  const theme = themes[v.theme];
  const pad = large ? "p-8" : "p-5";
  const h = thumb ? "h-40" : large ? "min-h-[420px]" : "h-56";
  return (
    <div className={`flex ${h} flex-col justify-between ${pad}`} style={{ background: theme.bg, color: theme.ink }}>
      <div>
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>{v.kicker}</p>
        <h4 className={`mt-2 font-display leading-tight ${large ? "text-4xl" : "text-2xl"}`}>{v.headline}</h4>
        <p className={`mt-2 ${large ? "text-base" : "text-xs"}`} style={{ color: theme.sub }}>{v.sub}</p>
        {v.bullets && (large || !thumb) && (
          <ul className={`mt-3 space-y-1 ${large ? "text-sm" : "text-[0.7rem]"}`} style={{ color: theme.sub }}>
            {v.bullets.map((x) => <li key={x} className="flex items-center gap-1.5"><span style={{ color: theme.accent }}>•</span> {x}</li>)}
          </ul>
        )}
      </div>
      <p className={`${large ? "text-xs" : "text-[0.58rem]"} font-medium uppercase tracking-wider`} style={{ color: theme.accent }}>{v.footer}</p>
    </div>
  );
}

function PreviewModal({ t, onClose }: { t: ContentTemplate; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try { await navigator.clipboard.writeText(t.body ?? ""); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  }

  function printVisual() {
    const v = t.visual!;
    const theme = themes[v.theme];
    const bullets = v.bullets?.map((x) => `<li style="margin:4px 0"><span style="color:${theme.accent}">•</span> ${x}</li>`).join("") ?? "";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${t.title} — The Farm 1893</title>
<style>
  @page { margin: 0.5in; }
  body { margin:0; font-family: Georgia, 'Times New Roman', serif; }
  .sheet { background:${theme.bg}; color:${theme.ink}; min-height:9in; padding:1in; display:flex; flex-direction:column; justify-content:space-between; box-sizing:border-box; }
  .kicker { font-family: Arial, sans-serif; letter-spacing:.2em; text-transform:uppercase; font-size:12px; font-weight:700; color:${theme.accent}; }
  h1 { font-size:52px; line-height:1.05; margin:16px 0 12px; }
  .sub { font-size:20px; color:${theme.sub}; max-width:70%; }
  ul { list-style:none; padding:0; margin:20px 0; font-size:18px; color:${theme.sub}; }
  .footer { font-family: Arial, sans-serif; text-transform:uppercase; letter-spacing:.12em; font-size:13px; color:${theme.accent}; }
</style></head><body>
  <div class="sheet">
    <div><div class="kicker">${v.kicker}</div><h1>${v.headline}</h1><div class="sub">${v.sub}</div><ul>${bullets}</ul></div>
    <div class="footer">${v.footer}</div>
  </div>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-parchment p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-ink">{t.title}</h2>
            <p className="text-xs text-stone">{t.category}{t.meta ? ` · ${t.meta}` : ""}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-stone hover:text-ink"><X size={22} /></button>
        </div>

        {t.format === "visual" && t.visual ? (
          <div className="overflow-hidden rounded-xl ring-1 ring-ink/10"><VisualPreview t={t} large /></div>
        ) : (
          <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-bone p-5 font-sans text-sm leading-relaxed text-ink-soft">{t.body}</pre>
        )}

        {t.body && <p className="mt-3 text-xs text-stone">Tip: fields like <code className="rounded bg-bone px-1">{"{{first_name}}"}</code> auto-fill when sent from a lead.</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          {t.format === "copy" ? (
            <button onClick={copy} className="btn btn-primary flex-1 !py-2.5 !text-sm">
              {copied ? <><Check size={15} /> Copied!</> : <><Copy size={15} /> Copy text</>}
            </button>
          ) : (
            <button onClick={printVisual} className="btn btn-primary flex-1 !py-2.5 !text-sm"><Printer size={15} /> Print / Save as PDF</button>
          )}
          <Link href="/dashboard/marketing" className="btn btn-ghost flex-1 !py-2.5 !text-sm"><Sparkles size={15} /> Customize with AI</Link>
        </div>
      </div>
    </div>
  );
}
