import Link from "next/link";
import { PostActions } from "@/components/admin/PostActions";
import { param } from "@/components/lab/FilterChips";
import { deleteEmptyDrafts } from "@/lib/admin/post-actions";
import { listAllPosts, type AdminPost } from "@/lib/admin/queries";
import { formatCount, formatRelative, formatShortDate } from "@/lib/format";
import { site } from "@/lib/site";

const TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "scheduled", label: "Scheduled" },
  { key: "published", label: "Published" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const STATUS_STYLE = {
  draft: "bg-paper-deep text-muted",
  scheduled: "bg-pen-soft text-pen",
  published: "bg-[#e3f1ec] text-green",
} as const;

export default async function AdminPostsPage(props: PageProps<"/admin">) {
  // Housekeeping: drafts that never got any content don't belong in the list.
  await deleteEmptyDrafts();
  const all = await listAllPosts();
  const requested = param((await props.searchParams).status);
  const tab: Tab = TABS.find((t) => t.key === requested)?.key ?? "all";
  const shown = tab === "all" ? all : all.filter((p) => p.status === tab);
  const count = (key: Tab) => (key === "all" ? all.length : all.filter((p) => p.status === key).length);

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-[28px]">Posts</h1>
        {/* A plain link: nothing is saved until you write something. */}
        <Link href="/admin/posts/new" className="rounded-note bg-ink px-4 py-2 text-[14px] text-paper">
          New post
        </Link>
      </div>

      <nav aria-label="Filter posts" className="mt-5 flex gap-1 border-b border-ink">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "all" ? "/admin" : `/admin?status=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={`-mb-px border-b-2 px-3 py-2 text-[14px] ${tab === t.key ? "border-amber font-medium" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label} <span className="font-mono text-[11px] text-muted">{count(t.key)}</span>
          </Link>
        ))}
      </nav>

      <ul>
        {shown.length === 0 && (
          <li className="py-10 text-center font-serif text-muted italic">
            {tab === "all" ? "Nothing yet. Start with a question." : `No ${TABS.find((t) => t.key === tab)?.label.toLowerCase()}.`}
          </li>
        )}
        {shown.map((p) => (
          <PostItem key={p.id} post={p} />
        ))}
      </ul>
    </main>
  );
}

function PostItem({ post: p }: { post: AdminPost }) {
  const live = p.status !== "draft";
  const when =
    p.status === "draft"
      ? `edited ${formatRelative(p.updatedAt)}`
      : p.status === "scheduled"
        ? `goes live ${formatShortDate(p.publishedAt)}`
        : `published ${formatShortDate(p.publishedAt)}`;

  return (
    <li className="flex flex-wrap items-start gap-x-6 gap-y-2 border-b border-line py-4">
      <div className="min-w-0 flex-1">
        <Link href={`/admin/posts/${p.id}`} className="ink-link font-serif text-[19px] leading-snug">
          {p.title || <span className="text-muted italic">Untitled draft</span>}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-[14px] text-muted">{p.subtitle || p.excerpt || "No content yet"}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted">
          <span className={`rounded-full px-2 py-0.5 ${STATUS_STYLE[p.status]}`}>{p.status}</span>
          <span>{when}</span>
          {p.verdict && <span>· {p.verdict}</span>}
          {live && (
            <>
              <span>·</span>
              <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="text-pen hover:underline">
                {new URL(site.url).host}/p/{p.slug}
              </a>
              <span>·</span>
              <Link href={`/stats?post=${p.slug}`} className="hover:text-ink hover:underline">
                {formatCount(p.reads)} {p.reads === 1 ? "read" : "reads"}
              </Link>
            </>
          )}
        </p>
      </div>
      <PostActions id={p.id} slug={p.slug} status={p.status} title={p.title} />
    </li>
  );
}
