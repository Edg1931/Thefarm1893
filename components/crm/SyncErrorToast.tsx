"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

/** Surfaces a visible error if a CRM save fails to reach the server (live mode). */
export function SyncErrorToast() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onErr() {
      setShow(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShow(false), 6000);
    }
    window.addEventListener("farm:sync-error", onErr);
    return () => { window.removeEventListener("farm:sync-error", onErr); clearTimeout(timer); };
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-6 left-6 z-[95] flex max-w-sm items-start gap-2 rounded-xl bg-terracotta px-4 py-3 text-sm text-parchment shadow-lg">
      <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      <span>That change couldn&apos;t be saved to the server. Check your connection and try again.</span>
      <button onClick={() => setShow(false)} aria-label="Dismiss" className="ml-1 shrink-0 opacity-70 hover:opacity-100"><X size={15} /></button>
    </div>
  );
}
