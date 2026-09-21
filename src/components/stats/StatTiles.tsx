import { formatCount } from "@/lib/format";

type Totals = { reads: number; avgDepth: number; finished: number; shares: number };

/** The four headline numbers. A number alone is the right form here, not a chart. */
export function StatTiles({ totals }: { totals: Totals }) {
  const tiles = [
    { label: "Reads", value: formatCount(totals.reads), hint: "one per reader per post per day" },
    { label: "Avg. read depth", value: `${totals.avgDepth}%`, hint: "how far down people scroll" },
    { label: "Read to the end", value: `${totals.finished}%`, hint: "reached the last paragraph" },
    { label: "Shares", value: formatCount(totals.shares), hint: "share buttons clicked" },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-note border border-line bg-card px-3.5 py-3">
          <dt className="text-[13px] text-muted">{t.label}</dt>
          <dd className="mt-0.5 font-serif text-[28px] leading-tight">{t.value}</dd>
          <dd className="text-[11px] text-muted">{t.hint}</dd>
        </div>
      ))}
    </dl>
  );
}
