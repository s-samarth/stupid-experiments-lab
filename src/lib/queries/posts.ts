/** Public read queries for posts. Only "live" posts are ever returned here. */
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, experiments, postReads, posts } from "@/lib/db";

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
  kind: posts.kind,
  stage: posts.stage,
  tags: posts.tags,
  readingMinutes: posts.readingMinutes,
  publishedAt: posts.publishedAt,
  reads: readsCount,
  experimentNumber: experiments.number,
  experimentSlug: experiments.slug,
  experimentTitle: experiments.title,
  verdict: experiments.verdict,
  experimentStatus: experiments.status,
};

export type PostListItem = Awaited<ReturnType<typeof listLivePosts>>[number];

type ListOptions = { limit?: number; kind?: "log" | "finding" | "essay"; tag?: string; search?: string };

export async function listLivePosts({ limit = 50, kind, tag, search }: ListOptions = {}) {
  const filters = [isLive];
  if (kind) filters.push(eq(posts.kind, kind));
  if (tag) filters.push(sql`${tag} = ANY(${posts.tags})`);
  if (search) {
    // Escape LIKE wildcards so "%" in a search means a literal percent sign.
    const pattern = `%${search.slice(0, 80).replace(/[\\%_]/g, "\\$&")}%`;
    filters.push(or(ilike(posts.title, pattern), ilike(posts.subtitle, pattern), ilike(posts.bodyHtml, pattern))!);
  }
  return db()
    .select(listColumns)
    .from(posts)
    .leftJoin(experiments, eq(posts.experimentId, experiments.id))
    .where(and(...filters))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

/** Findings for the home page: finished write-ups first, newest first. */
export function listFindings(limit = 5) {
  return listLivePosts({ limit, kind: "finding" });
}

export async function getLivePost(slug: string) {
  const rows = await db()
    .select({ post: posts, reads: readsCount })
    .from(posts)
    .where(and(eq(posts.slug, slug), isLive))
    .limit(1);
  return rows[0] ?? null;
}

/** All live entries in one experiment, oldest first (the lab log order). */
export function listExperimentEntries(experimentId: number) {
  return db()
    .select(listColumns)
    .from(posts)
    .leftJoin(experiments, eq(posts.experimentId, experiments.id))
    .where(and(eq(posts.experimentId, experimentId), isLive))
    .orderBy(asc(posts.publishedAt));
}

export async function listAllTags() {
  const rows = await db()
    .select({ tag: sql<string>`unnest(${posts.tags})` })
    .from(posts)
    .where(isLive);
  return [...new Set(rows.map((r) => r.tag))].sort();
}
