"use client";

import { useEffect } from "react";
import { sendEvent } from "@/lib/analytics/client";
import { readFraction } from "./ReadingProgress";

const THRESHOLDS = [25, 50, 75, 100] as const;

/**
 * Renders nothing. Counts one read when the post opens, then reports the
 * furthest quarter reached (at most four tiny requests per visit).
 */
export function ReadTracker({ postId, articleId }: { postId: number; articleId: string }) {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    sendEvent({ type: "read", postId, referrer: document.referrer, ref });

    const article = document.getElementById(articleId);
    if (!article) return;
    let reached = 0;
    const onScroll = () => {
      const pct = readFraction(article) * 100;
      const next = THRESHOLDS.filter((t) => pct >= t - 2).at(-1);
      if (next && next > reached) {
        reached = next;
        sendEvent({ type: "depth", postId, depth: next });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [postId, articleId]);

  return null;
}
