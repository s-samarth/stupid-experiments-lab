import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOOP_STAGES, promptForHeading } from "@/lib/loop";
import { loopTemplate } from "./template";

const headings = (d: ReturnType<typeof loopTemplate>) =>
  (d.content ?? []).filter((n) => n.type === "heading").map((n) => n.content?.[0]?.text);

describe("loopTemplate", () => {
  it("starts a post with the nine steps, in order", () => {
    assert.deepEqual(headings(loopTemplate()), LOOP_STAGES.map((s) => s.label));
  });

  it("writes a reader's question into step 1 and credits them", () => {
    const d = loopTemplate({ question: "Do typos build trust?", askedBy: "Priya" });
    const text = JSON.stringify(d.content?.slice(0, 3));
    assert.match(text, /Do typos build trust\?/);
    assert.match(text, /Asked by Priya/);
  });
});

describe("promptForHeading", () => {
  it("finds a step's prompt from its heading, ignoring case and spaces", () => {
    assert.equal(promptForHeading("  findings "), LOOP_STAGES.find((s) => s.key === "findings")?.prompt);
  });
  it("returns null for headings that aren't steps", () => {
    assert.equal(promptForHeading("My own heading"), null);
  });
  it("has nine steps with unique keys", () => {
    assert.equal(new Set(LOOP_STAGES.map((s) => s.key)).size, 9);
  });
});
