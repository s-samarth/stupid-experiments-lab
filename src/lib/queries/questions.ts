/** Public read queries for the question box. */
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db, posts, questions } from "@/lib/db";
import { isLive } from "./posts";

/** Questions readers can see: ones on the board, plus ones that became (live) posts. */
export function listPublicQuestions(limit = 100) {
  return db()
    .select({
      id: questions.id,
      text: questions.text,
      askerName: questions.askerName,
      source: questions.source,
      status: questions.status,
      postSlug: posts.slug,
      postTitle: posts.title,
    })
    .from(questions)
    // Only link to posts that are actually published.
    .leftJoin(posts, and(eq(questions.postId, posts.id), isLive))
    .where(inArray(questions.status, ["approved", "promoted"]))
    .orderBy(desc(questions.createdAt))
    .limit(limit);
}

/** Open (not yet explored) questions for the home page sticky note. */
export async function listOpenQuestions(limit = 3) {
  const [rows, [{ total }]] = await Promise.all([
    db()
      .select({ id: questions.id, text: questions.text })
      .from(questions)
      .where(eq(questions.status, "approved"))
      .orderBy(desc(questions.createdAt))
      .limit(limit),
    db()
      .select({ total: sql<number>`count(*)::int` })
      .from(questions)
      .where(eq(questions.status, "approved")),
  ]);
  return { questions: rows, total };
}
