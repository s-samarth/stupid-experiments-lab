import { VERDICT_COLOR, type Verdict } from "@/lib/loop";

/** Rubber-stamp label for how a post's experiment ended ("busted", "weird"...). */
export function Stamp({ verdict, className = "" }: { verdict: Verdict | null; className?: string }) {
  if (!verdict) return null;
  return <span className={`stamp ${VERDICT_COLOR[verdict]} ${className}`}>{verdict}</span>;
}
