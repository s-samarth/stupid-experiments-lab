import Link from "next/link";

type Row = { label: string; value: number; display: string; href?: string };

type Props = { title: string; rows: Row[]; empty?: string };

/** A ranked list with a thin magnitude bar under each label. Values are always printed. */
export function Breakdown({ title, rows, empty = "No reads yet." }: Props) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section>
      <h3 className="mb-2 font-mono text-[12px]">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-[14px] text-muted">{empty}</p>
      ) : (
        <ol>
          {rows.map((r) => (
            <li key={r.label} className="border-b border-line py-1.5 last:border-b-0">
              <div className="flex items-baseline justify-between gap-3 text-[14px]">
                {r.href ? (
                  <Link href={r.href} className="ink-link min-w-0 truncate">
                    {r.label}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate">{r.label}</span>
                )}
                <span className="shrink-0 font-mono text-[13px]">{r.display}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-paper-deep" aria-hidden>
                <div className="h-1 rounded-full bg-chart" style={{ width: `${(r.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

