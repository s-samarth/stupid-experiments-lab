"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deletePost, publishPost, unpublishPost } from "@/lib/admin/post-actions";
import type { SaveStatus } from "./useAutosave";

type Props = {
  postId: number | null;
  status: "draft" | "scheduled" | "published";
  slug: string;
  saveStatus: SaveStatus;
  saveError: string | null;
  /** Saves any pending changes now; resolves with an error message or null. */
  flush: () => Promise<string | null>;
  wordCount: number;
  onToggleSettings: () => void;
  notify: (message: string) => void;
};

const STATUS_TEXT: Record<SaveStatus, string> = { saved: "Saved", unsaved: "Unsaved changes", saving: "Saving…", error: "Not saved" };
const STATUS_CHIP = { draft: "bg-paper-deep text-muted", scheduled: "bg-pen-soft text-pen", published: "bg-[#e3f1ec] text-green" } as const;
const ghost = "rounded-note border border-line px-3 py-1.5 text-[13px] hover:border-ink aria-disabled:pointer-events-none aria-disabled:opacity-40";

export function EditorTopBar({ postId, status, slug, saveStatus, saveError, flush, wordCount, onToggleSettings, notify }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [when, setWhen] = useState("");
  // useTransition gives a pending flag while a server action runs.
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const live = status !== "draft";
  const saved = postId !== null;

  const publish = (at: string | null) =>
    startTransition(async () => {
      // Save what's on screen first, so the published version is the latest one.
      const err = await flush();
      if (err) return notify(`Couldn't save: ${err}`);
      if (postId === null) return notify("Write something first.");
      const r = await publishPost(postId, at ? new Date(at).toISOString() : null);
      if (!r.ok) return notify(r.error);
      setMenuOpen(false);
      notify(at && new Date(at).getTime() > Date.now() ? "Scheduled" : "Published");
      // Re-fetch this page's server data so the status and URL update.
      router.refresh();
    });

  const remove = () => {
    if (postId === null) return router.push("/admin");
    const what = live ? "This takes it off the site and deletes it and its read stats" : "Delete this draft";
    if (confirm(`${what}. This can't be undone. Continue?`)) startTransition(() => deletePost(postId));
  };

  const saveText = !saved && saveStatus === "saved" ? "Empty posts aren't saved. Start writing." : `${STATUS_TEXT[saveStatus]}${saveError ? `: ${saveError}` : ""}`;

  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-[#fbfaf6]/95 px-5 py-2.5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3 text-[13px]">
        <Link href="/admin" className="text-muted hover:text-ink">← Posts</Link>
        <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${STATUS_CHIP[status]}`}>{saved ? status : "new"}</span>
        <span className={`truncate font-mono text-[11px] ${saveStatus === "error" ? "text-red" : "text-muted"}`} title={saveError ?? undefined} aria-live="polite">
          {saveText}
        </span>
        <span className="hidden font-mono text-[11px] text-muted sm:inline">· {wordCount} words</span>
      </div>
      <div className="relative flex items-center gap-2">
        <Link
          href={saved ? (live ? `/p/${slug}` : `/admin/posts/${postId}/preview`) : "#"}
          target="_blank"
          aria-disabled={!saved}
          className={ghost}
        >
          {live ? "View live ↗" : "Preview ↗"}
        </Link>
        <button type="button" onClick={onToggleSettings} className={ghost}>Settings</button>
        <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} className="rounded-note bg-ink px-4 py-1.5 text-[13px] text-paper">
          {live ? "Update ▾" : "Publish ▾"}
        </button>
        {menuOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 rounded-note border border-line bg-card p-4 text-[13px] shadow-lg">
            {live ? (
              <p className="text-muted">Edits to a live post go out as you type. Change its date, or take it down:</p>
            ) : (
              <button type="button" disabled={pending} onClick={() => publish(null)} className="w-full rounded-note bg-ink py-2 text-paper disabled:opacity-60">
                {pending ? "Publishing…" : "Publish now"}
              </button>
            )}
            <label className="mt-3 block text-[12px] text-muted" htmlFor="publish-at">
              {live ? "Publish date" : "Or pick a date: future schedules it, past backdates it"}
            </label>
            <div className="mt-1 flex gap-2">
              <input id="publish-at" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="min-w-0 flex-1 rounded-note border border-line px-2 py-1" />
              <button type="button" disabled={!when || pending} onClick={() => publish(when)} className="rounded-note border border-ink px-2.5 disabled:opacity-40">
                Set
              </button>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-3">
              {live && postId !== null ? (
                <button
                  type="button"
                  onClick={() => startTransition(async () => { await unpublishPost(postId); notify("Moved back to drafts"); setMenuOpen(false); router.refresh(); })}
                  className="text-muted hover:text-ink"
                >
                  Unpublish (back to drafts)
                </button>
              ) : <span />}
              <button type="button" onClick={remove} className="text-red">
                {saved ? "Delete" : "Discard"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
