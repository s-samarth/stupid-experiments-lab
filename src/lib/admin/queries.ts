/** Owner-only reads. Only import from pages that call requireOwner() first. */
import { desc, eq, sql } from "drizzle-orm";
import { db, postReads, posts, questions } from "@/lib/db";

export type AdminPost = Awaited<ReturnType<typeof listAllPosts>>[number];

export function listAllPosts() {
  return db()
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      subtitle: posts.subtitle,
      // First words of the post, so an untitled draft is still recognisable.
      // (Section headings are dropped first so it starts with your own words.)
      excerpt: sql<string>`left(trim(regexp_replace(regexp_replace(${posts.bodyHtml}, '<h2[^>]*>.*?</h2>', ' ', 'g'), '<[^>]+>', ' ', 'g')), 140)`,
      status: posts.status,
      verdict: posts.verdict,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      reads: sql<number>`(SELECT count(*)::int FROM ${postReads} pr WHERE pr.post_id = ${sql.raw('"posts"."id"')})`,
    })
    .from(posts)
    .orderBy(sql`CASE ${posts.status} WHEN 'draft' THEN 0 WHEN 'scheduled' THEN 1 ELSE 2 END`, desc(posts.updatedAt));
}

export async function getPostForEdit(id: number) {
  const rows = await db().select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Every question, newest first, with the post it became (if any). */
export function listQuestionsForReview() {
  return db()
    .select({
      id: questions.id,
      text: questions.text,
      askerName: questions.askerName,
      source: questions.source,
      status: questions.status,
      createdAt: questions.createdAt,
      postId: questions.postId,
      postTitle: posts.title,
      postStatus: posts.status,
    })
    .from(questions)
    .leftJoin(posts, eq(questions.postId, posts.id))
    .orderBy(desc(questions.createdAt));
}

export type ReviewQuestion = Awaited<ReturnType<typeof listQuestionsForReview>>[number];

export async function pendingQuestionCount(): Promise<number> {
  const [row] = await db().select({ n: sql<number>`count(*)::int` }).from(questions).where(eq(questions.status, "pending"));
  return row?.n ?? 0;
}
