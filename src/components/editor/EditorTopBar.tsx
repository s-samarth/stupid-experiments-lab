"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost, publishPost, unpublishPost } from "@/lib/admin/post-actions";
import type { SaveStatus } from "./useAutosave";

type Props = {
  postId: number;
  status: "draft" | "scheduled" | "published";
  slug: string;
  saveStatus: SaveStatus;
  saveError: string | null;
  onToggleSettings: () => void;
  notify: (message: string) => void;
};

const STATUS_TEXT: Record<SaveStatus, string> = { saved: "Saved", unsaved: "Unsaved changes", saving: "Saving…", error: "Not saved" };
const ghost = "rounded-note border border-line px-3 py-1.5 text-[13px] hover:border-ink";

export function EditorTopBar({ postId, status, slug, saveStatus, saveError, onToggleSettings, notify }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [when, setWhen] = useState("");
  // useTransition gives a pending flag while a server action runs.
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const live = status !== "draft";

  const publish = (at: string | null) =>
    startTransition(async () => {
      const r = await publishPost(postId, at ? new Date(at).toISOString() : null);
      if (!r.ok) return notify(r.error);
      setMenuOpen(false);
      notify(at && new Date(at).getTime() > Date.now() ? "Scheduled" : "Published");
      // Re-fetch this page's server data so the status and URL update.
      router.refresh();
    });

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-[#fbfaf6]/95 px-5 py-2.5 backdrop-blur">
      <div className="flex items-center gap-3 text-[13px]">
        <Link href="/admin" className="text-muted hover:text-ink">← Posts</Link>
        <span className={`font-mono text-[11px] ${saveStatus === "error" ? "text-red" : "text-muted"}`} title={saveError ?? undefined} aria-live="polite">
          {STATUS_TEXT[saveStatus]}{saveError ? `: ${saveError}` : ""}
        </span>
      </div>
      <div className="relative flex items-center gap-2">
        <Link href={live ? `/p/${slug}` : `/admin/posts/${postId}/preview`} target="_blank" className={ghost}>
          {live ? "View ↗" : "Preview ↗"}
        </Link>
        <button type="button" onClick={onToggleSettings} className={ghost}>Settings</button>
        <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} className="rounded-note bg-ink px-4 py-1.5 text-[13px] text-paper">
          {live ? (status === "scheduled" ? "Scheduled ▾" : "Published ▾") : "Publish ▾"}
        </button>
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 rounded-note border border-line bg-card p-4 text-[13px] shadow-lg">
            {!live && (
              <button type="button" disabled={pending} onClick={() => publish(null)} className="w-full rounded-note bg-ink py-2 text-paper disabled:opacity-60">
                Publish now
              </button>
            )}
            <label className="mt-3 block text-[12px] text-muted" htmlFor="publish-at">
              {live ? "Change publish date" : "Or schedule (future) or backdate (past)"}
            </label>
            <div className="mt-1 flex gap-2">
              <input id="publish-at" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="min-w-0 flex-1 rounded-note border border-line px-2 py-1" />
              <button type="button" disabled={!when || pending} onClick={() => publish(when)} className="rounded-note border border-ink px-2.5 disabled:opacity-40">
                Set
              </button>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-3">
              {live ? (
                <button type="button" onClick={() => startTransition(async () => { await unpublishPost(postId); notify("Moved back to drafts"); setMenuOpen(false); router.refresh(); })} className="text-muted hover:text-ink">
                  Unpublish
                </button>
              ) : <span />}
              <button
                type="button"
                onClick={() => confirm("Delete this post for good? This can't be undone.") && startTransition(() => deletePost(postId))}
                className="text-red"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
