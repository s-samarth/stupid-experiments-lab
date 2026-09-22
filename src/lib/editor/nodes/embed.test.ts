import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeHref } from "./blocks";
import { detectEmbed } from "./embed";

describe("detectEmbed", () => {
  it("recognises the supported providers", () => {
    assert.equal(detectEmbed("https://youtu.be/dQw4w9WgXcQ")?.frameSrc, "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    assert.equal(detectEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")?.kind, "youtube");
    assert.equal(detectEmbed("https://vimeo.com/123456")?.kind, "vimeo");
    assert.equal(detectEmbed("https://open.spotify.com/track/abc123")?.kind, "spotify");
    assert.equal(detectEmbed("https://x.com/someone/status/12345")?.kind, "x");
    assert.equal(detectEmbed("https://gist.github.com/someone/abc")?.kind, "gist");
  });
  it("falls back to a link card for anything else", () => {
    assert.equal(detectEmbed("https://example.com/post")?.kind, "link");
  });
  it("rejects non-links and non-web schemes", () => {
    assert.equal(detectEmbed("not a url"), null);
    assert.equal(detectEmbed("javascript:alert(1)"), null);
  });
});

describe("safeHref", () => {
  it("keeps web, mail and in-site links", () => {
    for (const href of ["https://a.com", "http://a.com", "mailto:me@a.com", "/p/x", "#top"]) assert.equal(safeHref(href), href);
  });
  it("neutralises script links", () => {
    assert.equal(safeHref("javascript:alert(1)"), "#");
    assert.equal(safeHref("data:text/html,hi"), "#");
  });
});
