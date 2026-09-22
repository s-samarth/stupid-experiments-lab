/**
 * IndexNow: tells Bing, Yandex, Seznam and others the moment a page changes, so a
 * new post can be crawled within minutes instead of days. Bing's index also feeds
 * ChatGPT search and Copilot, so this matters for AI answers too.
 *
 * The key isn't a secret: the protocol proves we own the site by serving the same
 * key at /<key>.txt (see public/). Google doesn't support IndexNow; it uses the sitemap.
 */
import { site } from "@/lib/site";

export const INDEXNOW_KEY = "16198647da2818e30e738a8e9c8d5faa";

/** Pings IndexNow with these paths. Never throws; skipped outside production. */
export async function pingIndexNow(paths: string[]): Promise<void> {
  if (process.env.VERCEL_ENV !== "production" || site.url.includes("localhost")) return;
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(site.url).host,
        key: INDEXNOW_KEY,
        keyLocation: `${site.url}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `${site.url}${p}`),
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Best effort: search engines still find the page through the sitemap.
  }
}
