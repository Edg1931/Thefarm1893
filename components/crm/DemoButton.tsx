"use client";

import { useState } from "react";
import { Check } from "lucide-react";

/**
 * A button for demo-only actions (send contract, new sequence, etc.) that gives
 * clear feedback via a toast instead of silently doing nothing. Swap for the
 * real handler once the matching integration (Stripe, email) is connected.
 */
export function DemoButton({
  children, className, toast,
}: {
  children: React.ReactNode; className?: string; toast: string;
}) {
  const [show, setShow] = useState(false);
  function click() {
    setShow(true);
    setTimeout(() => setShow(false), 2600);
  }
  return (
    <>
      <button onClick={click} className={className}>{children}</button>
      {show && (
        <div className="fixed bottom-6 right-6 z-[80] flex items-center gap-2 rounded-xl bg-sage-deep px-5 py-3 text-sm text-parchment shadow-lg">
          <Check size={16} /> {toast}
        </div>
      )}
    </>
  );
}
