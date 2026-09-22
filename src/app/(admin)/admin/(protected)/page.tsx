import Link from "next/link";
import { createPost } from "@/lib/admin/post-actions";
import { listAllPosts } from "@/lib/admin/queries";
import { formatCount, formatShortDate } from "@/lib/format";
import { site } from "@/lib/site";

const STATUS_STYLE = {
  draft: "bg-paper-deep text-muted",
  scheduled: "bg-pen-soft text-pen",
  published: "bg-[#e3f1ec] text-green",
} as const;

export default async function AdminPostsPage() {
  const all = await listAllPosts();

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-[28px]">Posts</h1>
        <form action={createPost}>
          <button type="submit" className="rounded-note bg-ink px-4 py-2 text-[14px] text-paper">
            New post
          </button>
        </form>
      </div>

      <table className="mt-6 w-full table-fixed text-left text-[14px]">
        <thead className="border-b border-ink font-mono text-[12px]">
          <tr>
            <th className="w-[52%] py-2 font-normal">Title</th>
            <th className="w-[12%] py-2 font-normal">Status</th>
            <th className="w-[12%] py-2 font-normal">Verdict</th>
            <th className="w-[12%] py-2 font-normal">Date</th>
            <th className="w-[12%] py-2 text-right font-normal">Reads</th>
          </tr>
        </thead>
        <tbody>
          {all.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center font-serif text-muted italic">
                Nothing yet. Start with a question.
              </td>
            </tr>
          )}
          {all.map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="truncate py-2.5 pr-3">
                <Link href={`/admin/posts/${p.id}`} className="ink-link font-serif text-[17px]">
                  {p.title || <span className="text-muted italic">Untitled draft</span>}
                </Link>
                {p.status !== "draft" && <LiveLink slug={p.slug} scheduled={p.status === "scheduled"} />}
              </td>
              <td className="py-2.5">
                <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${STATUS_STYLE[p.status]}`}>{p.status}</span>
              </td>
              <td className="py-2.5 font-mono text-[12px] text-muted">{p.verdict ?? "—"}</td>
              <td className="py-2.5 text-muted">{formatShortDate(p.status === "draft" ? p.updatedAt : p.publishedAt)}</td>
              <td className="py-2.5 text-right font-mono">
                {p.status === "draft" ? (
                  "—"
                ) : (
                  <Link href={`/stats?post=${p.slug}`} className="ink-link">
                    {formatCount(p.reads)}
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

/** Where the post lives publicly. Scheduled posts 404 until their time comes. */
function LiveLink({ slug, scheduled }: { slug: string; scheduled: boolean }) {
  const path = `/p/${slug}`;
  const label = `${new URL(site.url).host}${path}`;
  if (scheduled) return <span className="block truncate font-mono text-[11px] text-muted">goes live at {label}</span>;
  return (
    <a href={path} target="_blank" rel="noreferrer" className="block truncate font-mono text-[11px] text-pen hover:underline">
      {label} ↗
    </a>
  );
}
