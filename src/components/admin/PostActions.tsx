"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deletePost, unpublishPost } from "@/lib/admin/post-actions";

type Props = { id: number; slug: string; status: "draft" | "scheduled" | "published"; title: string };

const btn = "rounded-note border border-line px-2.5 py-1 text-[12px] hover:border-ink disabled:opacity-40";

/**
 * Row buttons on the posts list. A client component because Delete asks for
 * confirmation in the browser before calling the server action.
 */
export function PostActions({ id, slug, status, title }: Props) {
  const [pending, start] = useTransition();
  const live = status !== "draft";
  const name = title ? `"${title}"` : "this untitled draft";

  const remove = () => {
    const warning = live ? `Delete ${name}? It comes off the site and its read stats are deleted too.` : `Delete ${name}?`;
    if (confirm(`${warning} This can't be undone.`)) start(() => deletePost(id));
  };

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      <Link href={`/admin/posts/${id}`} className={btn}>Edit</Link>
      <Link href={status === "published" ? `/p/${slug}` : `/admin/posts/${id}/preview`} target="_blank" className={btn}>
        {status === "published" ? "View ↗" : "Preview ↗"}
      </Link>
      {live && (
        <button type="button" disabled={pending} onClick={() => start(() => unpublishPost(id))} className={btn}>
          Unpublish
        </button>
      )}
      <button type="button" disabled={pending} onClick={remove} className={`${btn} text-red`}>
        Delete
      </button>
    </div>
  );
}
