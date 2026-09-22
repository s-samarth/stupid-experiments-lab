/** Public read queries for posts. Only "live" posts are ever returned here. */
import { and, asc, desc, eq, gt, ilike, lt, or, sql } from "drizzle-orm";
import { db, postReads, posts } from "@/lib/db";
import type { Verdict } from "@/lib/loop";

/** Published, or scheduled with a publish time that has already passed. */
export const isLive = sql`(${posts.status} = 'published' OR (${posts.status} = 'scheduled' AND ${posts.publishedAt} <= now()))`;

/**
 * Total reads per post as a correlated subquery. The outer column is written as a
 * fully qualified raw name: Drizzle drops the table prefix in single-table queries,
 * and an unqualified "id" here would silently match post_reads.id instead.
 */
const readsCount = sql<number>`(SELECT count(*)::int FROM ${postReads} pr WHERE pr.post_id = ${sql.raw('"posts"."id"')})`;

const listColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  subtitle: posts.subtitle,
  tags: posts.tags,
  readingMinutes: posts.readingMinutes,
  publishedAt: posts.publishedAt,
  reads: readsCount,
  verdict: posts.verdict,
};

export type PostListItem = Awaited<ReturnType<typeof listLivePosts>>[number];

type ListOptions = { limit?: number; verdict?: Verdict; tag?: string; search?: string };

export async function listLivePosts({ limit = 50, verdict, tag, search }: ListOptions = {}) {
  const filters = [isLive];
  if (verdict) filters.push(eq(posts.verdict, verdict));
  if (tag) filters.push(sql`${tag} = ANY(${posts.tags})`);
  if (search) {
    // Escape LIKE wildcards so "%" in a search means a literal percent sign.
    const pattern = `%${search.slice(0, 80).replace(/[\\%_]/g, "\\$&")}%`;
    filters.push(or(ilike(posts.title, pattern), ilike(posts.subtitle, pattern), ilike(posts.bodyHtml, pattern))!);
  }
  return db()
    .select(listColumns)
    .from(posts)
    .where(and(...filters))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

export async function getLivePost(slug: string) {
  const rows = await db()
    .select({ post: posts, reads: readsCount })
    .from(posts)
    .where(and(eq(posts.slug, slug), isLive))
    .limit(1);
  return rows[0] ?? null;
}

export async function listAllTags() {
  const rows = await db()
    .select({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(isLive);
  return [...new Set(rows.map((r) => r.tag))].sort();
}

/** The posts on either side of this one, by publish date (for reading on). */
export async function getNeighbours(publishedAt: Date) {
  const pick = { slug: posts.slug, title: posts.title };
  const [older, newer] = await Promise.all([
    db().select(pick).from(posts).where(and(isLive, lt(posts.publishedAt, publishedAt))).orderBy(desc(posts.publishedAt)).limit(1),
    db().select(pick).from(posts).where(and(isLive, gt(posts.publishedAt, publishedAt))).orderBy(asc(posts.publishedAt)).limit(1),
  ]);
  return { older: older[0] ?? null, newer: newer[0] ?? null };
}

/** Counts for the "lab record" card: how the published posts ended. */
export async function getLabRecord() {
  const rows = await db().select({ verdict: posts.verdict }).from(posts).where(isLive);
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
  return { total: rows.length, confirmed: count("confirmed"), busted: count("busted"), weird: count("weird"), inconclusive: count("inconclusive") };
}
