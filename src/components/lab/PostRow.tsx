import Link from "next/link";
import { formatShortDate } from "@/lib/format";
import { experimentCode } from "@/lib/loop";
import type { PostListItem } from "@/lib/queries/posts";
import { ReadCount } from "./ReadCount";
import { Stamp } from "./Stamp";

const KIND_LABEL = { log: "log entry", finding: "finding", essay: "essay" } as const;

type Props = { post: PostListItem; showStamp?: boolean; showDate?: boolean };

/** One line in a list of writing: title, lab metadata, read count, verdict stamp. */
export function PostRow({ post, showStamp = true, showDate = false }: Props) {
  const code = post.experimentNumber ? experimentCode(post.experimentNumber) : KIND_LABEL[post.kind];
  const showVerdict = showStamp && post.kind === "finding";
  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={`/p/${post.slug}`} className="group flex items-start gap-4 py-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="ink-link font-serif text-[20px] leading-snug">{post.title}</h3>
          {post.subtitle && <p className="mt-1 line-clamp-1 font-serif text-[15px] text-muted italic">{post.subtitle}</p>}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
            <span className="font-mono text-[12px]">{code}</span>
            {showDate && <span>· {formatShortDate(post.publishedAt)}</span>}
            <span>· {post.readingMinutes} min read ·</span>
            <ReadCount count={post.reads} />
          </p>
        </div>
        {showVerdict && <Stamp verdict={post.verdict} status={post.experimentStatus} className="mt-1 shrink-0" />}
      </Link>
    </li>
  );
}
