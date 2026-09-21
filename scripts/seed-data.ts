/**
 * SAMPLE DATA FOR LOCAL DEVELOPMENT ONLY. Placeholder experiments so every page
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

export type SeedExperiment = {
  number: number; slug: string; title: string; question: string; hypothesis?: string; measure?: string;
  killCriterion?: string; stage: number; status: "running" | "writing-up" | "done" | "abandoned";
  verdict?: "confirmed" | "busted" | "weird" | "inconclusive"; scribble?: string; tags: string[];
  startedDaysAgo: number; endedDaysAgo?: number; spawnedFrom?: number;
};

export const EXPERIMENTS: SeedExperiment[] = [
  { number: 5, slug: "is-my-gut-a-good-investor", title: "Is my gut a good investor?", question: "Would my instinctive stock picks beat the market over three months?", hypothesis: "Gut picks will underperform Nifty 50.", stage: 9, status: "done", verdict: "busted", scribble: "my gut is a liar", tags: ["money", "behavior"], startedDaysAgo: 200, endedDaysAgo: 110 },
  { number: 7, slug: "2b-model-zero-internet", title: "A 2B model on a cheap phone, zero internet", question: "Can a tiny on-device model give useful emergency advice with no network?", hypothesis: "Hybrid retrieval makes a 2B model good enough for first-aid questions.", measure: "Recall@5 on 120 questions", stage: 9, status: "done", verdict: "weird", tags: ["ai", "on-device"], startedDaysAgo: 150, endedDaysAgo: 90 },
  { number: 8, slug: "instagram-ads-bad-theory", title: "I ran Instagram ads with ₹5,000 and a bad theory", question: "Does targeting by interest beat broad targeting for a tiny budget?", stage: 9, status: "done", verdict: "busted", tags: ["marketing"], startedDaysAgo: 120, endedDaysAgo: 100 },
  { number: 9, slug: "kirana-uncle-vs-dmart", title: "I trusted the kirana uncle over DMart. The data mostly agreed.", question: "Is the neighbourhood shop actually worse value, or does trust price in something?", stage: 9, status: "done", verdict: "confirmed", tags: ["behavior", "money"], startedDaysAgo: 80, endedDaysAgo: 60 },
  { number: 10, slug: "one-language-bangalore", title: "Does anyone in Bangalore speak one language?", question: "How often do people switch languages inside one sentence?", stage: 7, status: "writing-up", scribble: "no. obviously.", tags: ["language", "ai"], startedDaysAgo: 45 },
  { number: 11, slug: "llm-joke-open-mic", title: "Can an LLM write a joke that survives an open mic?", question: "Will a room laugh at a joke it doesn't know a model wrote?", stage: 3, status: "running", scribble: "booked a slot for Oct 4", tags: ["comedy", "ai"], startedDaysAgo: 9 },
  { number: 12, slug: "jev-vs-index", title: "Can Jev out-trade a boring index fund?", question: "Can a disciplined momentum rule beat the index over 60 days?", hypothesis: "A disciplined momentum rule will beat Nifty 50 over 60 days, before taxes and fees.", measure: "% return vs index", killCriterion: "down 10%", stage: 5, status: "running", scribble: "down 3.1%. hmm.", tags: ["money", "behavior"], startedDaysAgo: 19, spawnedFrom: 5 },
];

export type SeedPost = {
  slug: string; title: string; subtitle?: string; kind: "log" | "finding" | "essay";
  experiment?: number; stage?: number; tags: string[]; daysAgo: number; reads: number; body: JSONContent;
};

const filler = p("This is placeholder text for local development. The real write-up replaces it. It exists so the page has enough words to show how reading feels at length, how paragraphs breathe, and where the eye rests.");

export const POSTS: SeedPost[] = [
  { slug: "why-this-lab-exists", title: "Why this lab exists", subtitle: "Mostly so I stop saying 'someone should test that'.", kind: "essay", tags: ["meta"], daysAgo: 210, reads: 140, body: doc(p("Most of my ideas die in conversation. This is a place to let them die in public instead, with evidence."), filler) },
  { slug: "my-gut-is-a-liar", title: "My gut is a liar, and I have the spreadsheet", subtitle: "Three months of instinctive picks against a boring index.", kind: "finding", experiment: 5, stage: 7, tags: ["money"], daysAgo: 105, reads: 380, body: doc(verdict("busted"), p("I lost to the index by 6.4 points."), filler) },
  { slug: "2b-model-cheap-phone", title: "A 2B model on a ₹12k phone, zero internet", subtitle: "It worked. Just not in the way I expected.", kind: "finding", experiment: 7, stage: 7, tags: ["ai"], daysAgo: 88, reads: 3210, body: doc(p("Hybrid retrieval hit 89.7% recall at five, against 81.5% for keyword search alone."), callout("Surprise logged: the model was the least important part."), filler) },
  { slug: "instagram-ads-5000", title: "I ran Instagram ads with ₹5,000 and a bad theory", subtitle: "Interest targeting lost to 'show it to everyone'.", kind: "finding", experiment: 8, stage: 7, tags: ["marketing"], daysAgo: 98, reads: 1902, body: doc(verdict("busted"), filler) },
  { slug: "kirana-uncle-vs-dmart", title: "I trusted the kirana uncle over DMart. The data mostly agreed.", subtitle: "There's a pattern in almost everything I buy.", kind: "finding", experiment: 9, stage: 7, tags: ["behavior"], daysAgo: 58, reads: 2418, body: doc(verdict("confirmed"), filler, filler) },
  { slug: "jev-week-1", title: "Week 1: writing the rule before I'm scared", subtitle: "The rule is simple. Following it is the experiment.", kind: "log", experiment: 12, stage: 4, tags: ["money"], daysAgo: 18, reads: 410, body: doc(h(2, "The rule"), p("Buy on a 20-day high. Sell at minus four percent. No exceptions."), filler) },
  { slug: "jev-week-2", title: "Week 2: I don't believe my own rule", subtitle: "Sixty days, ₹25,000, one rule I'm not allowed to break.", kind: "log", experiment: 12, stage: 5, tags: ["money", "behavior"], daysAgo: 1, reads: 1284, body: doc(
    p("Week two was the week I discovered I don't actually believe my own rule. The rule says sell at −4%. On Tuesday the stock hit −4.2% and I watched my thumb hover over the button for eleven minutes.", note("I timed it. Eleven minutes is longer than most of my meetings.")),
    pull("A trading rule is just a promise you make to a version of yourself who isn't scared yet."),
    p("So the experiment has quietly split into two. One is about returns. The other is about whether I can follow instructions I wrote myself."),
    callout("Surprise logged. Rule violations: 2. Both times I was right. That's the dangerous part."),
    margin("being right for the wrong reason still counts as wrong."),
    filler,
  ) },
];

export const QUESTIONS = [
  { text: "Why do I trust reviews with typos more?", source: "owner" as const, status: "approved" as const },
  { text: "Is \"sleep on it\" real or just delay?", source: "owner" as const, status: "approved" as const },
  { text: "What if my calendar was public?", source: "owner" as const, status: "approved" as const },
  { text: "Do people tip more when the bill is a round number?", source: "reader" as const, status: "approved" as const, askerName: "Priya" },
  { text: "Can you learn to like a food you hate in 30 days?", source: "reader" as const, status: "pending" as const },
];
