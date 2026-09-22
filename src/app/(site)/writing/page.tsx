import type { Metadata } from "next";
import { FilterChips, param } from "@/components/lab/FilterChips";
import { PostRow } from "@/components/lab/PostRow";
import { VERDICTS } from "@/lib/loop";
import { listAllTags, listLivePosts } from "@/lib/queries/posts";
import { pageAlternates } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

/**
 * Filtered views all point at /writing as the one canonical page, and search
 * results aren't indexed at all (they'd be endless near-duplicates).
 */
export async function generateMetadata(props: PageProps<"/writing">): Promise<Metadata> {
  const { q } = await props.searchParams;
  return {
    title: "Writing",
    description: "Every experiment so far: the question, the test, and whether it was confirmed, busted, weird or inconclusive.",
    alternates: pageAlternates("/writing"),
    ...(q ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function WritingPage(props: PageProps<"/writing">) {
  const sp = await props.searchParams;
  const current = { verdict: param(sp.verdict), tag: param(sp.tag), q: param(sp.q) };
  const verdict = VERDICTS.find((v) => v === current.verdict);
  const [posts, tags] = await Promise.all([
    listLivePosts({ limit: 200, verdict, tag: current.tag, search: current.q }),
    listAllTags(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
      <h1 className="font-serif text-[36px] leading-tight">Writing</h1>
      <p className="mt-2 max-w-xl font-serif text-[18px] text-muted">Every post is one trip around the loop: a question, a test, and what I found.</p>

      {/* A plain GET form: submitting it just sets ?q= in the URL. */}
      <form action="/writing" className="mt-6 flex gap-2" role="search">
        {current.verdict && <input type="hidden" name="verdict" value={current.verdict} />}
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
        <FilterChips basePath="/writing" param="verdict" label="ended" current={current} options={VERDICTS.map((v) => ({ value: v, label: v }))} />
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
