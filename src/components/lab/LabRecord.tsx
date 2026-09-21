type Record = { total: number; confirmed: number; busted: number; weird: number; inconclusive: number };

/** The index card of outcomes. Failures are listed as proudly as successes. */
export function LabRecord({ record }: { record: Record }) {
  const rows: [string, number][] = [
    ["experiments", record.total],
    ["confirmed", record.confirmed],
    ["busted", record.busted],
    ["still weird", record.weird],
    ["inconclusive", record.inconclusive],
  ];
  const scribble =
    record.busted > record.confirmed ? "busted is winning. good." : record.total === 0 ? "clean slate." : "suspiciously successful.";

  return (
    <div className="rotate-[1.5deg] rounded-[2px] border border-line bg-card p-4">
      <p className="border-b border-red pb-1.5 font-mono text-[11px]">Lab record</p>
      <dl className="mt-2 text-[14px] leading-8">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <dt className="text-muted">{label}</dt>
            <dd className="font-mono">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-1.5 font-hand text-lg text-pen">{scribble}</p>
    </div>
  );
}
