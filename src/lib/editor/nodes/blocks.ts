/**
 * Simple custom blocks. Each Tiptap Node declares how it parses from HTML and
 * renders to HTML; those two functions are all the server renderer needs.
 */
import { mergeAttributes, Node } from "@tiptap/core";
import { VERDICTS, VERDICT_COLOR, type Verdict } from "@/lib/loop";

/** Tinted box for asides: "Surprise logged", warnings, notes to readers. */
export const Callout = Node.create({
  name: "callout",
  group: "block",
  content: "inline*",
  defining: true,
  addAttributes() {
    return {
      tone: {
        default: "pen",
        parseHTML: (el) => el.getAttribute("data-tone") ?? "pen",
        renderHTML: (attrs) => ({ "data-tone": attrs.tone }),
      },
    };
  },
  parseHTML: () => [{ tag: "aside.callout" }],
  renderHTML: ({ HTMLAttributes }) => ["aside", mergeAttributes(HTMLAttributes, { class: "callout" }), 0],
});

/** Boxed hypothesis statement. */
export const Hypothesis = Node.create({
  name: "hypothesis",
  group: "block",
  content: "inline*",
  defining: true,
  parseHTML: () => [{ tag: "div.hypothesis-card" }],
  renderHTML: ({ HTMLAttributes }) => ["div", mergeAttributes(HTMLAttributes, { class: "hypothesis-card" }), 0],
});

/** Handwritten aside in blue pen. */
export const MarginNote = Node.create({
  name: "marginNote",
  group: "block",
  content: "text*",
  marks: "",
  parseHTML: () => [{ tag: "p.margin-note" }],
  renderHTML: ({ HTMLAttributes }) => ["p", mergeAttributes(HTMLAttributes, { class: "margin-note" }), 0],
});

/** A verdict stamped into the text. */
export const VerdictStamp = Node.create({
  name: "verdictStamp",
  group: "block",
  atom: true,
  addAttributes() {
    return { verdict: { default: "inconclusive" } };
  },
  parseHTML: () => [
    {
      tag: "p.verdict-line",
      getAttrs: (el) => ({ verdict: el.querySelector(".stamp")?.textContent ?? "inconclusive" }),
    },
  ],
  renderHTML: ({ node }) => {
    const v = (VERDICTS as readonly string[]).includes(node.attrs.verdict) ? (node.attrs.verdict as Verdict) : "inconclusive";
    return ["p", { class: "verdict-line" }, ["span", { class: `stamp ${VERDICT_COLOR[v]}` }, v]];
  },
});

/** Centered call-to-action button (Substack's "button" block). */
export const ButtonBlock = Node.create({
  name: "buttonBlock",
  group: "block",
  atom: true,
  addAttributes() {
    return { href: { default: "" }, label: { default: "Read more" } };
  },
  parseHTML: () => [
    {
      tag: "div.button-block",
      getAttrs: (el) => {
        const a = el.querySelector("a");
        return { href: a?.getAttribute("href") ?? "", label: a?.textContent ?? "" };
      },
    },
  ],
  renderHTML: ({ node }) => [
    "div",
    { class: "button-block" },
    ["a", { href: safeHref(node.attrs.href), target: "_blank", rel: "noopener noreferrer" }, node.attrs.label],
  ],
});

/** Allows only http(s), mailto and in-site links. */
export function safeHref(href: string): string {
  const value = String(href ?? "").trim();
  return /^(https?:|mailto:|\/|#)/i.test(value) ? value : "#";
}
