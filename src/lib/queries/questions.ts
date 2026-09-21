/** Public read queries for the question box. */
import { desc, eq, inArray, sql } from "drizzle-orm";
import { db, experiments, questions } from "@/lib/db";

/** Questions visible to readers: approved ones, plus ones that became experiments. */
export function listPublicQuestions(limit = 100) {
  return db()
    .select({
      id: questions.id,
      text: questions.text,
      askerName: questions.askerName,
      source: questions.source,
      status: questions.status,
      experimentSlug: experiments.slug,
      experimentNumber: experiments.number,
    })
    .from(questions)
    .leftJoin(experiments, eq(questions.experimentId, experiments.id))
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
