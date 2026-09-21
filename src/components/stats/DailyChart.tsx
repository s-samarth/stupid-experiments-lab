import { formatCount, formatShortDate } from "@/lib/format";

type Props = { data: { day: string; reads: number }[] };

/**
 * Reads per day as a bar chart made of plain divs: no chart library needed.
 * Each column is a full-height hover target with a tooltip; a table view sits
 * underneath for screen readers and anyone who'd rather read numbers.
 */
export function DailyChart({ data }: Props) {
  const max = Math.max(1, ...data.map((d) => d.reads));
  const peak = data.reduce((best, d) => (d.reads > best.reads ? d : best), data[0] ?? { day: "", reads: 0 });

  return (
    <figure>
      <div className="flex gap-2">
        <div className="flex w-8 flex-col justify-between pb-5 text-right font-mono text-[11px] text-muted" aria-hidden>
          <span>{formatCount(max)}</span>
          <span>0</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex h-36 items-end gap-[2px] border-b border-line-strong" aria-hidden>
            {data.map((d) => (
              <div key={d.day} className="group relative flex h-full min-w-0 flex-1 items-end">
                <div
                  className="w-full rounded-t-[4px] bg-chart transition-opacity group-hover:opacity-80"
                  style={{ height: `${(d.reads / max) * 100}%`, minHeight: d.reads > 0 ? 2 : 0 }}
                />
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-note bg-ink px-2 py-1 text-[12px] text-paper group-hover:block">
                  {formatShortDate(d.day)} · {formatCount(d.reads)} {d.reads === 1 ? "read" : "reads"}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[11px] text-muted" aria-hidden>
            <span>{formatShortDate(data[0]?.day)}</span>
            <span>{formatShortDate(data.at(-1)?.day)}</span>
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-[13px] text-muted">
        Reads per day.{" "}
        {peak.reads > 0 ? `Busiest: ${formatShortDate(peak.day)} with ${formatCount(peak.reads)}.` : "No reads in this range yet."}
      </figcaption>
      <details className="mt-2 text-[13px]">
        <summary className="cursor-pointer text-muted">Show as table</summary>
        <table className="mt-2 w-full max-w-xs text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Reads</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.day} className="border-b border-line">
                <td className="py-0.5">{formatShortDate(d.day)}</td>
                <td className="py-0.5 text-right font-mono">{formatCount(d.reads)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
