import Link from "next/link";
import { experimentCode } from "@/lib/loop";
import type { PostListItem } from "@/lib/queries/posts";
import { ReadCount } from "./ReadCount";
import { ShareBar } from "./ShareBar";

type ExperimentStub = { number: number; slug: string; title: string };

type Props = {
  postId: number;
  slug: string;
  url: string;
  title: string;
  reads: number;
  experiment: ExperimentStub | null;
  parent: ExperimentStub | null;
  next: PostListItem | null;
  entryTotal: number;
};

const card = "group block rounded-note border border-dashed border-line-strong px-4 py-3 transition-colors hover:border-ink";

/** Read count, share buttons, and where to go next in the lab. */
export function PostFooter({ postId, slug, url, title, reads, experiment, parent, next, entryTotal }: Props) {
  return (
    <footer className="mt-12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink py-4">
        <Link href={`/stats?post=${slug}`} className="ink-link text-[14px] text-muted">
          <ReadCount count={reads} suffix={reads === 1 ? " person read this" : " people read this"} />
        </Link>
        <ShareBar postId={postId} url={url} title={title} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {parent && (
          <Link href={`/experiments/${parent.slug}`} className={card}>
            <p className="font-mono text-[11px] text-muted">spawned from</p>
            <p className="ink-link mt-1 font-serif text-[17px]">
              {experimentCode(parent.number)} · {parent.title}
            </p>
          </Link>
        )}
        {experiment && (
          <Link href={`/experiments/${experiment.slug}`} className={card}>
            <p className="font-mono text-[11px] text-muted">in this experiment</p>
            <p className="ink-link mt-1 font-serif text-[17px]">
              {entryTotal} {entryTotal === 1 ? "entry" : "entries"}
              {next ? ` · next: ${next.title}` : " · see the whole log"} →
            </p>
          </Link>
        )}
      </div>
    </footer>
  );
}
