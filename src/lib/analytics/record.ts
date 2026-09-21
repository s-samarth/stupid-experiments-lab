/** Database writes for analytics events. */
import { and, eq, sql } from "drizzle-orm";
import { db, postReads, shareEvents } from "@/lib/db";

type Visit = {
  postId: number;
  visitorHash: string;
  day: string;
  referrerHost: string | null;
  country: string | null;
  device: string;
};

/** One read per visitor per post per day; repeats are ignored by the unique index. */
export async function recordRead(visit: Visit): Promise<void> {
  await db().insert(postReads).values(visit).onConflictDoNothing();
}

/** Keeps the furthest point this visitor reached today. */
export async function recordDepth(postId: number, visitorHash: string, day: string, depth: number): Promise<void> {
  await db()
    .update(postReads)
    .set({ maxDepth: sql`greatest(${postReads.maxDepth}, ${depth})` })
    .where(and(eq(postReads.postId, postId), eq(postReads.visitorHash, visitorHash), eq(postReads.day, day)));
}

export async function recordShare(postId: number, channel: string): Promise<void> {
  await db().insert(shareEvents).values({ postId, channel });
}
