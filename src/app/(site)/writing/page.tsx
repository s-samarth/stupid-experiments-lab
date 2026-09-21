import type { Metadata } from "next";
import { FilterChips, param } from "@/components/lab/FilterChips";
import { PostRow } from "@/components/lab/PostRow";
import { listAllTags, listLivePosts } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Writing" };

const KINDS = [
  { value: "finding", label: "findings" },
  { value: "log", label: "log entries" },
  { value: "essay", label: "essays" },
] as const;

export default async function WritingPage(props: PageProps<"/writing">) {
  const sp = await props.searchParams;
  const current = { kind: param(sp.kind), tag: param(sp.tag), q: param(sp.q) };
  const kind = KINDS.find((k) => k.value === current.kind)?.value;
  const [posts, tags] = await Promise.all([
    listLivePosts({ limit: 200, kind, tag: current.tag, search: current.q }),
    listAllTags(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
      <h1 className="font-serif text-[36px] leading-tight">Writing</h1>
      <p className="mt-2 max-w-xl font-serif text-[18px] text-muted">Log entries from the middle of things, findings from the end of them.</p>

      {/* A plain GET form: submitting it just sets ?q= in the URL. */}
      <form action="/writing" className="mt-6 flex gap-2" role="search">
        {current.kind && <input type="hidden" name="kind" value={current.kind} />}
        <label htmlFor="q" className="sr-only">Search writing</label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={current.q}
          placeholder="kirana, momentum, hinglish…"
          className="w-full max-w-sm rounded-note border border-line-strong bg-card px-3 py-1.5 text-[14px] placeholder:text-muted focus:border-ink focus:outline-none"
        />
        <button type="submit" className="rounded-note border border-ink px-3 text-[14px] hover:bg-amber-soft">
          Search
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <FilterChips basePath="/writing" param="kind" label="kind" current={current} options={[...KINDS]} />
        {tags.length > 0 && <FilterChips basePath="/writing" param="tag" label="tag" current={current} options={tags.map((t) => ({ value: t, label: t }))} />}
      </div>

      <ul className="mt-6 border-t border-ink">
        {posts.length === 0 && <li className="py-6 font-serif text-muted italic">Nothing here. Try a different filter.</li>}
        {posts.map((p) => (
          <PostRow key={p.id} post={p} showDate />
        ))}
      </ul>
    </div>
  );
}
