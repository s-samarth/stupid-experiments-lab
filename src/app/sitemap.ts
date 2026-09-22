import type { MetadataRoute } from "next";
import { listLivePosts } from "@/lib/queries/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listLivePosts({ limit: 1000 });
  const pages = ["", "/writing", "/questions", "/stats", "/about"].map((path) => ({ url: `${site.url}${path}` }));
  return [...pages, ...posts.map((p) => ({ url: `${site.url}/p/${p.slug}`, lastModified: p.publishedAt ?? undefined }))];
}
