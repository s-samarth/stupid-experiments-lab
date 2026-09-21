/** Small display formatters shared across pages. */

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });
const shortDateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const countFmt = new Intl.NumberFormat("en-IN");

/** "21 Sep 2026" */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  return dateFmt.format(new Date(value));
}

/** "21 Sep" when it's this year, "21 Sep 2025" otherwise. */
export function formatShortDate(value: Date | string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  return d.getFullYear() === new Date().getFullYear() ? shortDateFmt.format(d) : dateFmt.format(d);
}

/** "2,418" (Indian grouping for large numbers: "1,20,000"). */
export function formatCount(n: number): string {
  return countFmt.format(n);
}

/** Days since a date, counting the start day as day 1. */
export function dayNumber(since: string | Date | null): number | null {
  if (!since) return null;
  const ms = Date.now() - new Date(since).getTime();
  return Math.max(1, Math.floor(ms / 86_400_000) + 1);
}
