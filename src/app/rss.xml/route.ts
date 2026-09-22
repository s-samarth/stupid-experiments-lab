/** RSS feed of published writing: full content, so feed readers don't need to click through. */
import { desc } from "drizzle-orm";
import { db, posts } from "@/lib/db";
import { isLive } from "@/lib/queries/posts";
import { author, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;

export async function GET() {
  const rows = await db()
    .select({ slug: posts.slug, title: posts.title, subtitle: posts.subtitle, html: posts.bodyHtml, tags: posts.tags, publishedAt: posts.publishedAt })
    .from(posts)
    .where(isLive)
    .orderBy(desc(posts.publishedAt))
    .limit(50);

  const items = rows
    .map((p) => {
      const url = `${site.url}/p/${p.slug}`;
      return `<item>
  <title>${escape(p.title)}</title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${p.publishedAt?.toUTCString() ?? ""}</pubDate>
  <dc:creator>${escape(author.name)}</dc:creator>
  ${p.tags.map((t) => `<category>${escape(t)}</category>`).join("")}
  ${p.subtitle ? `<description>${escape(p.subtitle)}</description>` : ""}
  <content:encoded>${cdata(p.html)}</content:encoded>
</item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>${escape(site.fullName)}</title>
  <link>${site.url}</link>
  <description>${escape(site.tagline)}</description>
  <language>en</language>
  <lastBuildDate>${(rows[0]?.publishedAt ?? new Date()).toUTCString()}</lastBuildDate>
  <atom:link href="${site.url}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=600" },
  });
}
