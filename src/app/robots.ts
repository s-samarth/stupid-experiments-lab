import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Everyone, including AI crawlers (GPTBot, ClaudeBot, PerplexityBot,
 * Google-Extended…), may read the public site: being quoted by AI answers is
 * part of the point. They're named explicitly so the intent is clear and so a
 * future blanket rule can't shut them out by accident. /llms.txt is the AI map.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
];
const PRIVATE = ["/admin", "/api", "/md/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
