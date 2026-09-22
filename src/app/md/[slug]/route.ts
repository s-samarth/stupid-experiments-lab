/**
 * A post as Markdown. Readers reach it as /p/<slug>.md (a rewrite in
 * next.config.ts maps that here); the post page links to it for agents.
 */
import { getLivePost } from "@/lib/queries/posts";
import { postMarkdown, textResponse } from "@/lib/seo/llms";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/md/[slug]">) {
  const { slug } = await ctx.params;
  const found = await getLivePost(slug);
  if (!found) return new Response("Not found", { status: 404 });
  const res = textResponse(postMarkdown(found.post), "text/markdown");
  // Points search engines at the real page, so this copy never competes with it.
  res.headers.set("link", `<${site.url}/p/${slug}>; rel="canonical"`);
  return res;
}
