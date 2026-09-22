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

const relativeFmt = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "just now", "5 minutes ago", "yesterday", then a date after a week. */
export function formatRelative(value: Date | string | null | undefined): string {
  if (!value) return "";
  const seconds = (new Date(value).getTime() - Date.now()) / 1000;
  const abs = Math.abs(seconds);
  if (abs < 60) return "just now";
  if (abs < 3600) return relativeFmt.format(Math.round(seconds / 60), "minute");
  if (abs < 86_400) return relativeFmt.format(Math.round(seconds / 3600), "hour");
  if (abs < 7 * 86_400) return relativeFmt.format(Math.round(seconds / 86_400), "day");
  return formatShortDate(value);
}
