import type { MetadataRoute } from "next";
import { listExperiments } from "@/lib/queries/experiments";
import { listLivePosts } from "@/lib/queries/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, experiments] = await Promise.all([listLivePosts({ limit: 1000 }), listExperiments()]);
  const pages = ["", "/experiments", "/writing", "/questions", "/stats", "/about"].map((path) => ({ url: `${site.url}${path}` }));
  return [
    ...pages,
    ...experiments.map((e) => ({ url: `${site.url}/experiments/${e.slug}` })),
    ...posts.map((p) => ({ url: `${site.url}/p/${p.slug}`, lastModified: p.publishedAt ?? undefined })),
  ];
}
