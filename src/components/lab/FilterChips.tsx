import Link from "next/link";

type Option = { value: string; label: string };

type Props = {
  /** Page path, e.g. "/writing". */
  basePath: string;
  /** Query-string key this row controls, e.g. "status". */
  param: string;
  options: Option[];
  /** All current search params, so other filters are kept when this one changes. */
  current: Record<string, string | undefined>;
  label: string;
  /** Label for the chip that clears this filter. */
  allLabel?: string;
  /**
   * For filters that always have a value (like a date range): the option used
   * when the URL has none. It's shown in its natural place instead of an "all" chip.
   */
  defaultValue?: string;
};

/**
 * A row of filter chips. Each chip is a plain link to the same page with one
 * query param changed: the URL holds the filter state, so it works without JS
 * and filtered views are shareable.
 */
export function FilterChips({ basePath, param, options, current, label, allLabel = "all", defaultValue }: Props) {
  const active = current[param] ?? defaultValue;
  const hrefFor = (value?: string) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(current)) if (v && k !== param) params.set(k, v);
    // The default option gets the clean URL, so there's only one address for it.
    if (value && value !== defaultValue) params.set(param, value);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const chip = (on: boolean) =>
    `rounded-full border px-2.5 py-0.5 font-mono text-[12px] ${on ? "border-ink bg-amber-soft" : "border-line-strong hover:border-ink"}`;

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      <span className="mr-1 text-[12px] text-muted">{label}</span>
      {defaultValue === undefined && (
        <Link href={hrefFor()} className={chip(!active)} aria-current={!active ? "true" : undefined}>
          {allLabel}
        </Link>
      )}
      {options.map((o) => (
        <Link key={o.value} href={hrefFor(o.value)} className={chip(active === o.value)} aria-current={active === o.value ? "true" : undefined}>
          {o.label}
        </Link>
      ))}
    </div>
  );
}

/** Reads a single string value from Next's searchParams object. */
export function param(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value || undefined;
}
