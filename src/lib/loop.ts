/** The nine-step experiment loop, plus the statuses and verdicts experiments carry. */

export const LOOP_STAGES = [
  { n: 1, key: "question", label: "question", blurb: "Capture something interesting." },
  { n: 2, key: "clarify", label: "clarify", blurb: "What am I actually trying to understand?" },
  { n: 3, key: "research", label: "research", blurb: "Existing evidence and competing views." },
  { n: 4, key: "hypothesis", label: "hypothesis", blurb: "A working theory I could be wrong about." },
  { n: 5, key: "experiment", label: "experiment", blurb: "Design it and actually run it." },
  { n: 6, key: "log", label: "log", blurb: "Decisions, failures, surprises." },
  { n: 7, key: "findings", label: "findings", blurb: "What happened, stated plainly." },
  { n: 8, key: "reflect", label: "reflect", blurb: "What this changes in my thinking." },
  { n: 9, key: "next", label: "next?", blurb: "The next question becomes an experiment." },
] as const;

export type LoopStage = (typeof LOOP_STAGES)[number]["n"];

export const EXPERIMENT_STATUSES = ["running", "writing-up", "done", "abandoned"] as const;
export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export const VERDICTS = ["confirmed", "busted", "weird", "inconclusive"] as const;
export type Verdict = (typeof VERDICTS)[number];

/** Tailwind text colour for each verdict stamp. */
export const VERDICT_COLOR: Record<Verdict | "running", string> = {
  confirmed: "text-green",
  busted: "text-red",
  weird: "text-pen",
  inconclusive: "text-muted",
  running: "text-amber-deep",
};

export function stageLabel(stage: number): string {
  return LOOP_STAGES.find((s) => s.n === stage)?.label ?? "question";
}

/** Formats an experiment number as its lab code, e.g. 12 -> "EXP-012". */
export function experimentCode(number: number): string {
  return `EXP-${String(number).padStart(3, "0")}`;
}
