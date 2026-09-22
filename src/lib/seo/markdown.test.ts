import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { JSONContent } from "@tiptap/core";
import { docExcerpt, docToMarkdown } from "./markdown";

const text = (t: string, marks?: JSONContent["marks"]): JSONContent => ({ type: "text", text: t, marks });
const p = (...content: JSONContent[]): JSONContent => ({ type: "paragraph", content });
const h2 = (t: string): JSONContent => ({ type: "heading", attrs: { level: 2 }, content: [text(t)] });
const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

describe("docToMarkdown", () => {
  it("writes headings, marks and links", () => {
    const md = docToMarkdown(doc(h2("Question"), p(text("Does "), text("this", [{ type: "bold" }]), text(" work", [{ type: "link", attrs: { href: "https://x.dev" } }]))));
    assert.equal(md, "## Question\n\nDoes **this**[ work](https://x.dev)\n");
  });

  it("drops template steps that were left empty", () => {
    const md = docToMarkdown(doc(h2("Question"), p(text("Why?")), h2("Clarify"), { type: "paragraph" }, h2("Research"), p(text("Reading."))));
    assert.doesNotMatch(md, /Clarify/);
    assert.match(md, /## Research/);
  });

  it("turns lab blocks, math and images into readable text", () => {
    const md = docToMarkdown(
      doc(
        { type: "verdictStamp", attrs: { verdict: "busted" } },
        { type: "hypothesis", content: [p(text("Typos build trust."))] },
        { type: "blockMath", attrs: { latex: "e=mc^2" } },
        { type: "figure", attrs: { src: "https://img/a.png", alt: "A chart", caption: "Reads per day" } },
      ),
    );
    assert.match(md, /\*\*Verdict: BUSTED\*\*/);
    assert.match(md, /> \*\*Hypothesis:\*\* Typos build trust\./);
    assert.match(md, /\$\$\ne=mc\^2\n\$\$/);
    assert.match(md, /!\[A chart\]\(https:\/\/img\/a\.png\)\n\*Reads per day\*/);
  });

  it("numbers lists and collects footnotes at the end", () => {
    const li = (t: string): JSONContent => ({ type: "listItem", content: [p(text(t))] });
    const md = docToMarkdown(doc({ type: "orderedList", content: [li("one"), li("two")] }, p(text("Claim"), { type: "footnote", attrs: { text: "Source." } })));
    assert.match(md, /1\. one\n2\. two/);
    assert.match(md, /Claim\[\^1\]\n\n\[\^1\]: Source\./);
  });
});

describe("docExcerpt", () => {
  it("skips headings and cuts at a word with an ellipsis", () => {
    const d = doc(h2("Question"), p(text("I wanted to know whether cheap phones can run a small model offline, all day long.")));
    assert.equal(docExcerpt(d, 40), "I wanted to know whether cheap phones…");
  });

  it("keeps short text whole", () => {
    assert.equal(docExcerpt(doc(p(text("Short one."))), 40), "Short one.");
  });
});
