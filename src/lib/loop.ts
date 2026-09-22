/**
 * The nine-step loop every post follows, top to bottom, plus the verdicts a
 * post can end on. The same list drives the home page explainer, the about
 * page and the template a new post starts from.
 */

export const LOOP_STAGES = [
  { n: 1, key: "question", label: "Question", blurb: "Something caught my attention.", prompt: "What made you curious? State the question in one line." },
  { n: 2, key: "clarify", label: "Clarify", blurb: "What am I actually trying to understand?", prompt: "Narrow it down. What exactly are you trying to find out, and what's out of scope?" },
  { n: 3, key: "research", label: "Research", blurb: "What's already known, and who disagrees.", prompt: "What did you read or ask? Where do existing answers disagree?" },
  { n: 4, key: "hypothesis", label: "Hypothesis", blurb: "A guess I could be wrong about.", prompt: "Your working theory, stated so it could turn out false. (Try the Hypothesis block: type /hyp)" },
  { n: 5, key: "experiment", label: "Experiment", blurb: "Design it, then actually run it.", prompt: "What did you do, with what, for how long? How will you judge it?" },
  { n: 6, key: "log", label: "Log", blurb: "Decisions, failures, surprises along the way.", prompt: "What happened along the way: decisions, mistakes, surprises." },
  { n: 7, key: "findings", label: "Findings", blurb: "What happened, stated plainly.", prompt: "What happened, stated plainly. Add a verdict stamp with /verdict." },
  { n: 8, key: "reflect", label: "Reflect", blurb: "What this changes in how I think.", prompt: "What changed in your thinking? What would you do differently?" },
  { n: 9, key: "next", label: "Next question", blurb: "The next question starts the loop again.", prompt: "What do you want to find out next?" },
] as const;

export type LoopStage = (typeof LOOP_STAGES)[number];

export const VERDICTS = ["confirmed", "busted", "weird", "inconclusive"] as const;
export type Verdict = (typeof VERDICTS)[number];

/** Tailwind text colour for each verdict stamp. */
export const VERDICT_COLOR: Record<Verdict, string> = {
  confirmed: "text-green",
  busted: "text-red",
  weird: "text-pen",
  inconclusive: "text-muted",
};

/** The template prompt for a section heading, if the heading is one of the nine. */
export function promptForHeading(text: string): string | null {
  const t = text.trim().toLowerCase();
  return LOOP_STAGES.find((s) => s.label.toLowerCase() === t)?.prompt ?? null;
}
