import Link from "next/link";
import { ReadCount } from "./ReadCount";
import { ShareBar } from "./ShareBar";

type Neighbour = { slug: string; title: string } | null;

type Props = {
  postId: number;
  slug: string;
  url: string;
  title: string;
  reads: number;
  older: Neighbour;
  newer: Neighbour;
};

const card = "group block rounded-note border border-dashed border-line-strong px-4 py-3 transition-colors hover:border-ink";

/** Read count, share buttons, and where to go next. */
export function PostFooter({ postId, slug, url, title, reads, older, newer }: Props) {
  // Readers usually arrive at the newest post, so "read on" points backwards when it can't go forwards.
  const next = newer ?? older;
  return (
    <footer className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink py-4">
        <Link href={`/stats?post=${slug}`} className="ink-link text-[14px] text-muted">
          <ReadCount count={reads} suffix={reads === 1 ? " person read this" : " people read this"} />
        </Link>
        <ShareBar postId={postId} url={url} title={title} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Link href="/questions" className={card}>
          <p className="font-mono text-[11px] text-muted">got a next question?</p>
          <p className="ink-link mt-1 font-serif text-[17px]">Drop it in the question box →</p>
        </Link>
        {next && (
          <Link href={`/p/${next.slug}`} className={card}>
            <p className="font-mono text-[11px] text-muted">{newer ? "newer post" : "older post"}</p>
            <p className="ink-link mt-1 font-serif text-[17px]">{next.title} →</p>
          </Link>
        )}
      </div>
    </footer>
  );
}
