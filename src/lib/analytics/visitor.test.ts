import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deviceType, isBot, referrerHost, visitorHash } from "./visitor";

describe("isBot", () => {
  it("filters crawlers, link previews and empty user agents", () => {
    for (const ua of ["", "Googlebot/2.1", "WhatsApp/2.23", "facebookexternalhit/1.1", "curl/8.0"]) assert.ok(isBot(ua), ua);
  });
  it("lets real browsers through", () => {
    assert.ok(!isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"));
  });
});

describe("referrerHost", () => {
  const own = "lab.samarthsaraswat.com";
  it("normalises common referrers", () => {
    assert.equal(referrerHost("https://t.co/abc", null, own), "x.com");
    assert.equal(referrerHost("https://www.linkedin.com/feed/", null, own), "linkedin.com");
    assert.equal(referrerHost("https://lnkd.in/xyz", null, own), "linkedin.com");
    assert.equal(referrerHost("https://www.google.com/", null, own), "google.com");
  });
  it("ignores visits from the site itself", () => {
    assert.equal(referrerHost(`https://${own}/writing`, null, own), null);
  });
  it("falls back to the ?ref= tag when apps send no referrer", () => {
    assert.equal(referrerHost("", "whatsapp", own), "whatsapp");
    assert.equal(referrerHost("", "<script>", own), null);
  });
});

describe("visitorHash", () => {
  it("is stable within a day and different the next day", () => {
    const a = visitorHash("1.2.3.4", "ua", "2026-09-22");
    assert.equal(a, visitorHash("1.2.3.4", "ua", "2026-09-22"));
    assert.notEqual(a, visitorHash("1.2.3.4", "ua", "2026-09-23"));
    assert.doesNotMatch(a, /1\.2\.3\.4/);
  });
});

describe("deviceType", () => {
  it("tells phones, tablets and desktops apart", () => {
    assert.equal(deviceType("Mozilla/5.0 (iPhone; ...) Mobile"), "mobile");
    assert.equal(deviceType("Mozilla/5.0 (iPad; ...)"), "tablet");
    assert.equal(deviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X)"), "desktop");
  });
});
