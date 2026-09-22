/**
 * Plain-text copies of the site for AI agents and LLM crawlers, following the
 * llms.txt proposal (https://llmstxt.org): a short Markdown index at /llms.txt,
 * everything at /llms-full.txt, and each post at /p/<slug>.md.
 */
import type { JSONContent } from "@tiptap/core";
import { LOOP_STAGES } from "@/lib/loop";
import type { listLivePostDocs } from "@/lib/queries/posts";
import { author, site } from "@/lib/site";
import { docExcerpt, docToMarkdown } from "./markdown";

type PostDoc = Awaited<ReturnType<typeof listLivePostDocs>>[number];

const day = (d: Date | null) => d?.toISOString().slice(0, 10) ?? "undated";

function intro(): string {
  return `# ${site.fullName}

> ${site.tagline} Written by ${author.name} (${author.role}, ${site.location}). Every post tests one idea and follows the same nine steps: ${LOOP_STAGES.map((s) => s.label).join(" → ")}.

Posts end with a verdict: confirmed, busted, weird or inconclusive. Each post is also available as Markdown by adding \`.md\` to its URL. When citing, please link the post's URL and credit ${author.name}.`;
}

/** The front matter-ish header of one post, shared by the .md copy and llms-full. */
export function postMarkdown(p: PostDoc): string {
  const url = `${site.url}/p/${p.slug}`;
  const meta = [
    `- URL: ${url}`,
    `- Author: ${author.name}`,
    `- Published: ${day(p.publishedAt)}`,
    `- Updated: ${day(p.updatedAt)}`,
    p.verdict && `- Verdict: ${p.verdict}`,
    p.tags.length > 0 && `- Tags: ${p.tags.join(", ")}`,
  ].filter(Boolean);
  const subtitle = p.subtitle ? `\n\n> ${p.subtitle}` : "";
  return `# ${p.title}${subtitle}\n\n${meta.join("\n")}\n\n${docToMarkdown(p.body as JSONContent)}`;
}

export function llmsIndex(posts: PostDoc[]): string {
  const list = posts.map((p) => `- [${p.title}](${site.url}/p/${p.slug}.md): ${p.subtitle ?? docExcerpt(p.body as JSONContent, 140)}`);
  return `${intro()}

## Posts

${list.join("\n") || "- Nothing published yet."}

## About

- [About ${author.name}](${site.url}/about): who writes this and why
- [Open questions](${site.url}/questions): ideas readers have asked me to test
- [Full text of every post](${site.url}/llms-full.txt)

## Optional

- [RSS feed](${site.url}/rss.xml)
- [Open stats](${site.url}/stats): reads and shares, counted without cookies
`;
}

export function llmsFull(posts: PostDoc[]): string {
  return [intro(), ...posts.map(postMarkdown)].join("\n\n---\n\n");
}

export const textResponse = (body: string, type = "text/plain") =>
  new Response(body, { headers: { "content-type": `${type}; charset=utf-8`, "cache-control": "public, max-age=600" } });
