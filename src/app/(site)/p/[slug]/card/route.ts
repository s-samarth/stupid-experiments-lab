/**
 * The generated share card for a post, at /p/<slug>/card.
 *
 * This is a plain route rather than an `opengraph-image` file on purpose: Next
 * lets a file-based image override `generateMetadata`, which silently ignored a
 * share image uploaded in the editor's Settings. The post page now uses the
 * uploaded image when there is one, and this card otherwise.
 */
import { renderCard } from "@/lib/og";
import { getLivePost } from "@/lib/queries/posts";
import { site } from "@/lib/site";

export async function GET(_req: Request, ctx: RouteContext<"/p/[slug]/card">) {
  const { slug } = await ctx.params;
  const found = await getLivePost(slug);
  const res = await (found
    ? renderCard({ kicker: found.post.tags[0] ?? "lab notes", title: found.post.title, subtitle: found.post.subtitle, stamp: found.post.verdict })
    : renderCard({ kicker: "lab", title: site.fullName }));
  res.headers.set("cache-control", "public, max-age=600, s-maxage=3600");
  return res;
}
