import type { Experiment } from "@/lib/db/schema";
import { Stamp } from "./Stamp";

type Props = Pick<Experiment, "hypothesis" | "measure" | "killCriterion" | "verdict" | "status">;

/** The experiment's hypothesis, pinned at the top of every entry. */
export function HypothesisCard({ hypothesis, measure, killCriterion, verdict, status }: Props) {
  if (!hypothesis) return null;
  return (
    <div className="relative rounded-note border border-ink bg-card px-4 py-3.5">
      <p className="mb-1.5 font-mono text-[11px]">Hypothesis</p>
      <p className="font-serif text-[18px] leading-snug">{hypothesis}</p>
      {(measure || killCriterion) && (
        <p className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
          {measure && (
            <span>
              <span className="font-mono">measure:</span> {measure}
            </span>
          )}
          {killCriterion && (
            <span>
              <span className="font-mono">kill if:</span> {killCriterion}
            </span>
          )}
        </p>
      )}
      <span className="absolute -top-2.5 right-3 bg-paper px-1">
        <Stamp verdict={verdict} status={status} className="rotate-3!" />
      </span>
    </div>
  );
}
