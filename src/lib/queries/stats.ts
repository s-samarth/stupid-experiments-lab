/**
 * Aggregate-only stats for the public /stats page. Nothing here can identify a
 * reader: every query returns counts or averages.
 */
import { and, desc, eq, gte, sql, type SQL } from "drizzle-orm";
import { db, postReads, posts, shareEvents } from "@/lib/db";
import { isLive } from "./posts";

export const RANGES = { "7": 7, "30": 30, "90": 90, all: null } as const;
export type RangeKey = keyof typeof RANGES;

type Scope = { days: number | null; postId?: number };

function sinceDay(days: number | null): string | null {
  if (!days) return null;
  return new Date(Date.now() - (days - 1) * 86_400_000).toISOString().slice(0, 10);
}

function readFilters({ days, postId }: Scope): SQL | undefined {
  const since = sinceDay(days);
  return and(since ? gte(postReads.day, since) : undefined, postId ? eq(postReads.postId, postId) : undefined);
}

export async function getTotals(scope: Scope) {
  const since = sinceDay(scope.days);
  const [[reads], [shares]] = await Promise.all([
    db()
      .select({
        reads: sql<number>`count(*)::int`,
        avgDepth: sql<number>`coalesce(round(avg(${postReads.maxDepth})), 0)::int`,
        finished: sql<number>`coalesce(round(100.0 * avg(case when ${postReads.maxDepth} >= 100 then 1 else 0 end)), 0)::int`,
      })
      .from(postReads)
      .where(readFilters(scope)),
    db()
      .select({ shares: sql<number>`count(*)::int` })
      .from(shareEvents)
      .where(
        and(
          since ? gte(shareEvents.createdAt, sql`${since}::date`) : undefined,
          scope.postId ? eq(shareEvents.postId, scope.postId) : undefined,
        ),
      ),
  ]);
  return { ...reads, shares: shares.shares };
}

/** Reads per day, including zero days, oldest first. "All time" starts at the first read (max a year). */
export async function getDailyReads(scope: Scope): Promise<{ day: string; reads: number }[]> {
  const days = scope.days ?? (await daysSinceFirstRead(scope.postId));
  const postFilter = scope.postId ? sql`AND ${postReads.postId} = ${scope.postId}` : sql``;
  const rows = await db().execute<{ day: string; reads: number }>(sql`
    SELECT to_char(d::date, 'YYYY-MM-DD') AS day, count(${postReads.id})::int AS reads
    FROM generate_series(current_date - ${days - 1}::int, current_date, interval '1 day') AS d
    LEFT JOIN ${postReads} ON ${postReads.day} = d::date ${postFilter}
    GROUP BY d ORDER BY d`);
  return [...rows];
}

async function daysSinceFirstRead(postId?: number): Promise<number> {
  const [row] = await db()
    .select({ n: sql<number | null>`(current_date - min(${postReads.day}) + 1)::int` })
    .from(postReads)
    .where(postId ? eq(postReads.postId, postId) : undefined);
  return Math.min(365, Math.max(30, row?.n ?? 30));
}

export function getTopPosts(scope: Scope, limit = 8) {
  return db()
    .select({ slug: posts.slug, title: posts.title, reads: sql<number>`count(*)::int` })
    .from(postReads)
    .innerJoin(posts, eq(postReads.postId, posts.id))
    .where(readFilters(scope))
    .groupBy(posts.id)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);
}

/** Share of reads per referrer or country, as percentages. */
export async function getBreakdown(scope: Scope, column: "referrer" | "country", limit = 6) {
  const col = column === "referrer" ? postReads.referrerHost : postReads.country;
  const rows = await db()
    .select({ key: sql<string | null>`${col}`, reads: sql<number>`count(*)::int` })
    .from(postReads)
    .where(readFilters(scope))
    .groupBy(col)
    .orderBy(desc(sql`count(*)`));
  const total = rows.reduce((sum, r) => sum + r.reads, 0) || 1;
  const top = rows.slice(0, limit);
  const rest = rows.slice(limit).reduce((sum, r) => sum + r.reads, 0);
  const out = top.map((r) => ({ key: r.key, reads: r.reads, pct: Math.round((100 * r.reads) / total) }));
  if (rest > 0) out.push({ key: "other", reads: rest, pct: Math.round((100 * rest) / total) });
  return out;
}

export async function findPostForStats(slug: string) {
  const rows = await db().select({ id: posts.id, slug: posts.slug, title: posts.title }).from(posts).where(and(eq(posts.slug, slug), isLive)).limit(1);
  return rows[0] ?? null;
}
