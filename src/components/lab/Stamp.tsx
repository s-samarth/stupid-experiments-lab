import { VERDICT_COLOR, type ExperimentStatus, type Verdict } from "@/lib/loop";

type StampProps = {
  verdict: Verdict | null;
  status?: ExperimentStatus | null;
  className?: string;
};

/** Rubber-stamp label for an experiment's outcome ("busted", "weird"...). */
export function Stamp({ verdict, status, className = "" }: StampProps) {
  if (verdict) {
    return <span className={`stamp ${VERDICT_COLOR[verdict]} ${className}`}>{verdict}</span>;
  }
  if (status === "running" || status === "writing-up") {
    const label = status === "running" ? "still running" : "writing up";
    return <span className={`stamp ${VERDICT_COLOR.running} ${className}`}>{label}</span>;
  }
  if (status === "abandoned") {
    return <span className={`stamp text-muted ${className}`}>abandoned</span>;
  }
  return null;
}
