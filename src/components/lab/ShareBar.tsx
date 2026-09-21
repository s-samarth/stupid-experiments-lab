"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon, type IconName } from "@/components/site/Icon";
import { trackShare } from "@/lib/analytics/client";

type Props = { postId: number; url: string; title: string };

const CHANNELS: { key: string; icon: IconName; label: string; href: (u: string, t: string) => string }[] = [
  { key: "x", icon: "x", label: "Share on X", href: (u, t) => `https://x.com/intent/post?text=${t}&url=${u}` },
  { key: "linkedin", icon: "linkedin", label: "Share on LinkedIn", href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
  { key: "whatsapp", icon: "whatsapp", label: "Share on WhatsApp", href: (u, t) => `https://wa.me/?text=${t}%20${u}${encodeURIComponent("?ref=whatsapp")}` },
];

const pill = "inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[13px] transition-colors hover:border-ink";

/** Copy link + social share buttons. Each click is counted (no personal data). */
export function ShareBar({ postId, url, title }: Props) {
  const [copied, setCopied] = useState(false);
  const canShare = useCanNativeShare();
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link", url);
    }
    trackShare(postId, "copy");
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, url });
      trackShare(postId, "native");
    } catch {
      // The reader closed the share sheet. Nothing to do.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={copy} className={pill}>
        <Icon name={copied ? "check" : "link"} size={15} />
        <span aria-live="polite">{copied ? "Copied" : "Copy link"}</span>
      </button>
      {CHANNELS.map((c) => (
        <a
          key={c.key}
          href={c.href(u, t)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackShare(postId, c.key)}
          className={pill}
        >
          <Icon name={c.icon} size={15} label={c.label} />
        </a>
      ))}
      {canShare && (
        <button type="button" onClick={nativeShare} className={pill}>
          <Icon name="share" size={15} />
          Share
        </button>
      )}
    </div>
  );
}

const noopSubscribe = () => () => {};

/**
 * The Web Share API (the phone's own share sheet) only exists in some browsers.
 * useSyncExternalStore reads it safely: `false` on the server, the real answer
 * after hydration, with no mismatch warning.
 */
function useCanNativeShare(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );
}
