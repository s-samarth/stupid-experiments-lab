import type { MetadataRoute } from "next";
import { listLivePosts } from "@/lib/queries/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Every public page, with the date it last changed so crawlers know what to re-read. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listLivePosts({ limit: 1000 });
  const latest = posts.reduce<Date | undefined>((d, p) => (!d || p.updatedAt > d ? p.updatedAt : d), undefined);
  const pages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/writing`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site.url}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${site.url}/questions`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${site.url}/stats`, changeFrequency: "daily", priority: 0.3 },
  ];
  const postPages = posts.map((p) => ({
    url: `${site.url}/p/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));
  return [...pages, ...postPages];
}
