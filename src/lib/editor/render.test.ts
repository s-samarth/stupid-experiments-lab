/** The renderer turns editor JSON into the HTML readers see. Run with `npm test`. */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { JSONContent } from "@tiptap/core";
import { listSections, renderPost } from "./render";
import { loopTemplate } from "./template";

const text = (t: string): JSONContent => ({ type: "paragraph", content: [{ type: "text", text: t }] });
const h2 = (t: string): JSONContent => ({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: t }] });
const doc = (...content: JSONContent[]): JSONContent => ({ type: "doc", content });

describe("renderPost", () => {
  it("renders an untouched template to nothing, so it counts as empty", () => {
    assert.equal(renderPost(loopTemplate()).html, "");
  });

  it("drops sections left empty but keeps the ones with writing", () => {
    const { html } = renderPost(doc(h2("Question"), text("Why?"), h2("Clarify"), { type: "paragraph" }, h2("Findings"), text("It broke.")));
    assert.match(html, /Question/);
    assert.match(html, /Findings/);
    assert.doesNotMatch(html, /Clarify/);
  });

  it("gives every section heading a unique anchor id", () => {
    const { html } = renderPost(doc(h2("Log"), text("a"), h2("Log"), text("b")));
    assert.deepEqual(listSections(html), [
      { id: "log", title: "Log" },
      { id: "log-2", title: "Log" },
    ]);
  });

  it("takes the post's verdict from its first verdict stamp", () => {
    const stamp = (v: string): JSONContent => ({ type: "verdictStamp", attrs: { verdict: v } });
    assert.equal(renderPost(doc(text("x"), stamp("busted"), stamp("confirmed"))).verdict, "busted");
    assert.equal(renderPost(doc(text("x"))).verdict, null);
    assert.equal(renderPost(doc(stamp("nonsense"))).verdict, null);
  });

  it("numbers footnotes in reading order and lists them at the end", () => {
    const note = (t: string): JSONContent => ({ type: "footnote", attrs: { text: t } });
    const r = renderPost(doc({ type: "paragraph", content: [{ type: "text", text: "One" }, note("first")] }, { type: "paragraph", content: [note("second")] }));
    assert.equal(r.footnoteCount, 2);
    assert.ok(r.html.indexOf("first") < r.html.indexOf("second"));
    assert.match(r.html, /class="footnotes"/);
  });

  it("escapes text instead of passing HTML through", () => {
    const { html } = renderPost(doc(text("<script>alert(1)</script>")));
    assert.doesNotMatch(html, /<script>/);
  });

  it("estimates at least one minute of reading", () => {
    assert.equal(renderPost(doc(text("short"))).readingMinutes, 1);
    assert.equal(renderPost(doc(text("word ".repeat(1150)))).readingMinutes, 5);
  });
});
