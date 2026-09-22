import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { author } from "@/lib/site";
import { blogPostingSchema, graph, PERSON_ID, personSchema } from "./schema";

describe("structured data", () => {
  it("links the post to its author and marks it with dates", () => {
    const s = blogPostingSchema({
      slug: "typos",
      title: "Do typos build trust?",
      description: "I tested it.",
      publishedAt: new Date("2026-09-01T10:00:00Z"),
      updatedAt: new Date("2026-09-02T10:00:00Z"),
      tags: ["writing", "trust"],
      wordCount: 900,
      image: "https://x/card",
    });
    assert.equal(s["@type"], "BlogPosting");
    assert.equal(s.author["@id"], PERSON_ID);
    assert.equal(s.datePublished, "2026-09-01T10:00:00.000Z");
    assert.equal(s.dateModified, "2026-09-02T10:00:00.000Z");
    assert.equal(s.keywords, "writing, trust");
    assert.match(s.url, /\/p\/typos$/);
  });

  it("lists only web profiles as sameAs (not the email link)", () => {
    const p = personSchema();
    assert.equal(p.name, author.name);
    assert.ok(p.sameAs.every((u) => u.startsWith("http")));
  });

  it("wraps nodes in one schema.org graph", () => {
    assert.deepEqual(Object.keys(graph({})), ["@context", "@graph"]);
  });
});
