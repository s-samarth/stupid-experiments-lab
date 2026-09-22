"use server";

/** Owner-only server actions for the question box. */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/auth";
import { db, posts, questions } from "@/lib/db";
import { loopTemplate } from "@/lib/editor/template";
import { draftSlug } from "@/lib/slug";

function refresh() {
  revalidatePath("/questions");
  revalidatePath("/");
  revalidatePath("/admin/questions");
}

/**
 * Moves a question between buckets: "approved" puts it on the public board,
 * "pending" sends it back to the inbox, "rejected" hides it.
 */
export async function setQuestionStatus(id: number, status: "approved" | "rejected" | "pending") {
  await requireOwner();
  await db().update(questions).set({ status }).where(eq(questions.id, id));
  refresh();
}

export async function deleteQuestion(id: number) {
  await requireOwner();
  await db().delete(questions).where(eq(questions.id, id));
  refresh();
}

/** Starts a draft post from a question, with the question already written into step 1. */
export async function writeAboutQuestion(id: number) {
  await requireOwner();
  const [q] = await db().select().from(questions).where(eq(questions.id, id)).limit(1);
  if (!q) return;
  const askedBy = q.source === "reader" ? q.askerName || "a reader" : null;
  const [post] = await db()
    .insert(posts)
    .values({ slug: draftSlug(), title: q.text, body: loopTemplate({ question: q.text, askedBy }) })
    .returning({ id: posts.id });
  await db().update(questions).set({ status: "promoted", postId: post.id }).where(eq(questions.id, id));
  refresh();
  redirect(`/admin/posts/${post.id}`);
}

/** Owner's own questions skip the inbox and go straight on the board. */
export async function addOwnerQuestion(form: FormData) {
  await requireOwner();
  const value = String(form.get("text") ?? "").trim().slice(0, 280);
  if (value.length < 3) return;
  await db().insert(questions).values({ text: value, source: "owner", status: "approved" });
  refresh();
}
