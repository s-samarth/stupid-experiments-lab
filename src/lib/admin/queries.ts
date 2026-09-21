/** Owner-only reads. Only import from pages that call requireOwner() first. */
import { desc, eq, sql } from "drizzle-orm";
import { db, experiments, postReads, posts, questions } from "@/lib/db";

export function listAllPosts() {
  return db()
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      kind: posts.kind,
      status: posts.status,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      experimentNumber: experiments.number,
      reads: sql<number>`(SELECT count(*)::int FROM ${postReads} WHERE ${postReads.postId} = ${posts.id})`,
    })
    .from(posts)
    .leftJoin(experiments, eq(posts.experimentId, experiments.id))
    .orderBy(sql`CASE ${posts.status} WHEN 'draft' THEN 0 WHEN 'scheduled' THEN 1 ELSE 2 END`, desc(posts.updatedAt));
}

export async function getPostForEdit(id: number) {
  const rows = await db().select().from(posts).where(eq(posts.id, id)).limit(1);
  return rows[0] ?? null;
}

export function listExperimentOptions() {
  return db()
    .select({ id: experiments.id, number: experiments.number, title: experiments.title, stage: experiments.stage })
    .from(experiments)
    .orderBy(desc(experiments.number));
}

export function listAllExperiments() {
  return db().select().from(experiments).orderBy(desc(experiments.number));
}

export async function getExperimentForEdit(id: number) {
  const rows = await db().select().from(experiments).where(eq(experiments.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function nextExperimentNumber(): Promise<number> {
  const [row] = await db().select({ max: sql<number | null>`max(${experiments.number})` }).from(experiments);
  return (row?.max ?? 0) + 1;
}

export function listQuestionsForReview() {
  return db()
    .select()
    .from(questions)
    .orderBy(sql`CASE ${questions.status} WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 ELSE 2 END`, desc(questions.createdAt));
}

export async function pendingQuestionCount(): Promise<number> {
  const [row] = await db().select({ n: sql<number>`count(*)::int` }).from(questions).where(eq(questions.status, "pending"));
  return row?.n ?? 0;
}
