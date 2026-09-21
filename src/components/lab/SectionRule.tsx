/** Heavy ink rule with a mono label: the section divider used across the site. */
export function SectionRule({ label, aside }: { label: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-t border-ink pt-2.5 pb-1">
      <h2 className="font-mono text-[12px]">{label}</h2>
      {aside && <span className="text-[12px] text-muted">{aside}</span>}
    </div>
  );
}
