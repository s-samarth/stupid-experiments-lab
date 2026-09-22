/**
 * SAMPLE DATA FOR LOCAL DEVELOPMENT ONLY. Placeholder posts so every page
 * has something to render. Never seed production with this.
 */
import type { JSONContent } from "@tiptap/core";

// Tiny builders so documents stay readable here.
const t = (text: string, marks?: string[]): JSONContent => ({ type: "text", text, ...(marks ? { marks: marks.map((type) => ({ type })) } : {}) });
const p = (...content: (JSONContent | string)[]): JSONContent => ({ type: "paragraph", content: content.map((c) => (typeof c === "string" ? t(c) : c)) });
const h = (level: number, text: string): JSONContent => ({ type: "heading", attrs: { level }, content: [t(text)] });
const pull = (text: string): JSONContent => ({ type: "blockquote", attrs: { variant: "pull" }, content: [p(text)] });
const callout = (text: string): JSONContent => ({ type: "callout", attrs: { tone: "pen" }, content: [t(text)] });
const note = (text: string): JSONContent => ({ type: "footnote", attrs: { text } });
const margin = (text: string): JSONContent => ({ type: "marginNote", content: [t(text)] });
const verdict = (v: string): JSONContent => ({ type: "verdictStamp", attrs: { verdict: v } });
export const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

export type SeedPost = { slug: string; title: string; subtitle?: string; tags: string[]; daysAgo: number; reads: number; body: JSONContent };

const filler = p("This is placeholder text for local development. The real write-up replaces it. It exists so the page has enough words to show how reading feels at length, how paragraphs breathe, and where the eye rests.");

/** A post that walks the loop: one section per step, in order. */
const loop = (s: { question: string; hypothesis: string; findings: JSONContent[]; next: string }) =>
  doc(
    h(2, "Question"), p(s.question),
    h(2, "Clarify"), filler,
    h(2, "Research"), filler,
    h(2, "Hypothesis"), { type: "hypothesis", content: [t(s.hypothesis)] },
    h(2, "Experiment"), filler,
    h(2, "Log"), filler, margin("being right for the wrong reason still counts as wrong."),
    h(2, "Findings"), ...s.findings,
    h(2, "Reflect"), pull("A rule is just a promise you make to a version of yourself who isn't scared yet."), filler,
    h(2, "Next question"), p(s.next),
  );

export const POSTS: SeedPost[] = [
  { slug: "my-gut-is-a-liar", title: "My gut is a liar, and I have the spreadsheet", subtitle: "Three months of instinctive picks against a boring index.", tags: ["money", "behavior"], daysAgo: 105, reads: 380, body: loop({ question: "Would my instinctive stock picks beat the market over three months?", hypothesis: "Gut picks will underperform Nifty 50.", findings: [verdict("busted"), p("I lost to the index by 6.4 points.", note("Before fees. After fees it was worse."))], next: "Can a written rule beat my gut?" }) },
  { slug: "2b-model-cheap-phone", title: "A 2B model on a ₹12k phone, zero internet", subtitle: "It worked. Just not in the way I expected.", tags: ["ai"], daysAgo: 88, reads: 3210, body: loop({ question: "Can a tiny on-device model give useful first-aid advice with no network?", hypothesis: "Hybrid retrieval makes a 2B model good enough for first-aid questions.", findings: [verdict("weird"), p("Hybrid retrieval hit 89.7% recall at five, against 81.5% for keyword search alone."), callout("Surprise logged: the model was the least important part.")], next: "How small can the model get before it matters?" }) },
  { slug: "kirana-uncle-vs-dmart", title: "I trusted the kirana uncle over DMart. The data mostly agreed.", subtitle: "There's a pattern in almost everything I buy.", tags: ["behavior", "money"], daysAgo: 58, reads: 2418, body: loop({ question: "Is the neighbourhood shop actually worse value?", hypothesis: "DMart is at least 10% cheaper on a normal basket.", findings: [verdict("confirmed"), filler], next: "What is trust worth, in rupees?" }) },
  { slug: "one-language-bangalore", title: "Does anyone in Bangalore speak one language?", subtitle: "I counted language switches for a week.", tags: ["language"], daysAgo: 3, reads: 410, body: loop({ question: "How often do people switch languages inside one sentence?", hypothesis: "Most sentences I overhear mix at least two languages.", findings: [verdict("inconclusive"), filler], next: "Do speech models handle mid-sentence switches?" }) },
];

export const QUESTIONS = [
  { text: "Why do I trust reviews with typos more?", source: "owner" as const, status: "approved" as const },
  { text: "Is \"sleep on it\" real or just delay?", source: "owner" as const, status: "approved" as const },
  { text: "What if my calendar was public?", source: "owner" as const, status: "approved" as const },
  { text: "Do people tip more when the bill is a round number?", source: "reader" as const, status: "approved" as const, askerName: "Priya" },
  { text: "Can you learn to like a food you hate in 30 days?", source: "reader" as const, status: "pending" as const },
];
