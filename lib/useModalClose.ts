"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/**
 * Shared modal behavior: press Escape to close, lock body scroll, and — when a
 * container ref is passed — trap Tab focus inside the dialog and restore focus
 * to the previously-focused element on close. Backward compatible: existing
 * callers that pass only `onClose` keep Esc + scroll-lock with no focus trap.
 */
export function useModalClose(onClose: () => void, containerRef?: RefObject<HTMLElement | null>) {
  const cb = useRef(onClose);
  cb.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { cb.current(); return; }
      if (e.key === "Tab" && containerRef?.current) {
        const nodes = Array.from(containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Move focus into the dialog on open.
    if (containerRef?.current) {
      const firstFocusable = containerRef.current.querySelector<HTMLElement>(FOCUSABLE);
      firstFocusable?.focus();
    }

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      previouslyFocused?.focus?.();
    };
  }, [containerRef]);
}
