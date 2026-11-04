"use client";

import { useEffect } from "react";

/**
 * Feeds the cursor position into `.glass-interactive` elements (as --mx / --my)
 * so their highlight follows the pointer. One passive listener for the page.
 */
export function GlassPointer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last: HTMLElement | null = null;
    let frame = 0;

    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const el = (e.target as Element | null)?.closest?.<HTMLElement>(".glass-interactive") ?? null;
        if (last && last !== el) {
          last.style.removeProperty("--mx");
          last.style.removeProperty("--my");
        }
        if (el) {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${e.clientX - r.left}px`);
          el.style.setProperty("--my", `${e.clientY - r.top}px`);
        }
        last = el;
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return null;
}
