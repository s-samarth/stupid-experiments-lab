import { formatDate } from "@/lib/format";
import { experimentCode } from "@/lib/loop";
import { author } from "@/lib/site";
import { ReadCount } from "./ReadCount";

type Props = {
  title: string;
  subtitle: string | null;
  publishedAt: Date | null;
  readingMinutes: number;
  reads: number;
  tags: string[];
  experimentNumber?: number;
  entryIndex?: number;
  entryTotal?: number;
};

export function PostHeader(props: Props) {
  const { title, subtitle, publishedAt, readingMinutes, reads, tags, experimentNumber, entryIndex, entryTotal } = props;
  const meta = [
    experimentNumber ? experimentCode(experimentNumber) : "essay",
    ...tags.slice(0, 2),
    entryIndex && entryTotal && entryTotal > 1 ? `entry ${entryIndex} of ${entryTotal}` : null,
  ].filter(Boolean);

  return (
    <header>
      <p className="font-mono text-[12px] text-muted">{meta.join(" · ")}</p>
      <h1 className="mt-3 mb-2.5 font-serif text-[34px] leading-[1.1] text-balance sm:text-[40px]">{title}</h1>
      {subtitle && <p className="font-serif text-[20px] leading-snug text-muted italic">{subtitle}</p>}
      <div className="my-6 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px]">
        <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[11px] text-paper" aria-hidden>
          {author.initials}
        </span>
        <span>{author.name}</span>
        <span className="text-muted">
          · <time dateTime={publishedAt?.toISOString()}>{formatDate(publishedAt)}</time> · {readingMinutes} min ·
        </span>
        <ReadCount count={reads} suffix={reads === 1 ? " read" : " reads"} className="text-muted" />
      </div>
    </header>
  );
}
