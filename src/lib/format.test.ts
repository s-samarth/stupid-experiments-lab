import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCount, formatRelative } from "./format";
import { isDraftSlug, slugify } from "./slug";

describe("formatRelative", () => {
  const ago = (ms: number) => new Date(Date.now() - ms);
  it("reads naturally", () => {
    assert.equal(formatRelative(ago(10_000)), "just now");
    assert.equal(formatRelative(ago(5 * 60_000)), "5 minutes ago");
    assert.equal(formatRelative(ago(3 * 3_600_000)), "3 hours ago");
    assert.equal(formatRelative(ago(86_400_000)), "yesterday");
    assert.equal(formatRelative(null), "");
  });
});

describe("formatCount", () => {
  it("uses Indian digit grouping", () => {
    assert.equal(formatCount(120000), "1,20,000");
  });
});

describe("slugify", () => {
  it("makes clean URL slugs", () => {
    assert.equal(slugify("Week 2: I don't believe my rule!"), "week-2-i-dont-believe-my-rule");
    assert.equal(slugify("Café au lait"), "cafe-au-lait");
    assert.equal(slugify("!!!"), "untitled");
  });
  it("respects the length limit without a trailing dash", () => {
    const s = slugify("a ".repeat(100), 20);
    assert.ok(s.length <= 20 && !s.endsWith("-"));
  });
  it("recognises placeholder draft slugs", () => {
    assert.ok(isDraftSlug("draft-abc123"));
    assert.ok(!isDraftSlug("my-post"));
  });
});
