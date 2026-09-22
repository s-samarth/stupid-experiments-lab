import Link from "next/link";
import { formatShortDate } from "@/lib/format";
import type { PostListItem } from "@/lib/queries/posts";
import { ReadCount } from "./ReadCount";
import { Stamp } from "./Stamp";

type Props = { post: PostListItem; showStamp?: boolean; showDate?: boolean };

/** One line in a list of writing: title, lab metadata, read count, verdict stamp. */
export function PostRow({ post, showStamp = true, showDate = false }: Props) {
  const tag = post.tags[0];
  return (
    <li className="border-b border-line last:border-b-0">
      <Link href={`/p/${post.slug}`} className="group flex items-start gap-4 py-3.5">
        <div className="min-w-0 flex-1">
          <h3 className="ink-link font-serif text-[20px] leading-snug">{post.title}</h3>
          {post.subtitle && <p className="mt-1 line-clamp-1 font-serif text-[15px] text-muted italic">{post.subtitle}</p>}
          <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted">
            {tag && <span className="font-mono text-[12px]">{tag} ·</span>}
            {showDate && <span>{formatShortDate(post.publishedAt)} ·</span>}
            <span>{post.readingMinutes} min read ·</span>
            <ReadCount count={post.reads} />
          </p>
        </div>
        {showStamp && <Stamp verdict={post.verdict} className="mt-1 shrink-0" />}
      </Link>
    </li>
  );
}
