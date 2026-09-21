"use client";

import { useEffect, useState } from "react";

/**
 * Thin amber bar at the top of a post showing how far you've read.
 * A client component because it listens to scroll events in the browser.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      // requestAnimationFrame batches updates to at most once per painted frame.
      frame = requestAnimationFrame(() => setProgress(readFraction(target)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div className="sticky top-0 z-10 h-[3px] bg-paper-deep" aria-hidden>
      <div className="h-full bg-amber" style={{ width: `${Math.round(progress * 100)}%` }} />
    </div>
  );
}

/** 0 when the article top reaches the viewport top, 1 when its bottom is visible. */
export function readFraction(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  if (scrollable <= 0) return 1;
  return Math.min(1, Math.max(0, -rect.top / scrollable));
}
