"use client";

import { useEffect, useRef } from "react";

/**
 * Shared modal behavior: press Escape to close, and lock body scroll while open.
 * Call once at the top of any dialog component: `useModalClose(onClose)`.
 */
export function useModalClose(onClose: () => void) {
  const cb = useRef(onClose);
  cb.current = onClose;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cb.current();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, []);
}
