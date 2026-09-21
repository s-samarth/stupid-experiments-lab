"use server";

/** Owner-only server actions for experiments and the question box. */
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/auth";
import { db, experiments, questions } from "@/lib/db";
import { EXPERIMENT_STATUSES, VERDICTS } from "@/lib/loop";
import { slugify } from "@/lib/slug";
import { nextExperimentNumber } from "./queries";

const text = (max: number) => z.string().trim().max(max).transform((v) => v || null);
const date = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/).transform((v) => v || null);

const ExperimentForm = z.object({
  title: z.string().trim().min(3, "Give it a title.").max(160),
  slug: z.string().trim().max(80).transform((v) => v.toLowerCase().replace(/[^a-z0-9-]/g, "-")),
  question: z.string().trim().min(3, "What's the question?").max(400),
  hypothesis: text(400),
  measure: text(200),
  killCriterion: text(200),
  stage: z.coerce.number().int().min(1).max(9),
  status: z.enum(EXPERIMENT_STATUSES),
  verdict: z.union([z.enum(VERDICTS), z.literal("")]).transform((v) => v || null),
  scribble: text(80),
  tags: z.string().transform((v) => v.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8)),
  startedOn: date,
  endedOn: date,
  spawnedFromId: z.string().transform((v) => (v ? Number(v) : null)),
  isPublic: z.string().optional().transform((v) => v === "on"),
});

export type ExperimentFormState = { error: string } | null;

export async function saveExperiment(id: number | null, _prev: ExperimentFormState, form: FormData): Promise<ExperimentFormState> {
  await requireOwner();
  const parsed = ExperimentForm.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = { ...parsed.data, slug: parsed.data.slug || slugify(parsed.data.title) };
  if (id && data.spawnedFromId === id) return { error: "An experiment can't spawn itself." };

  try {
    if (id) {
      await db().update(experiments).set(data).where(eq(experiments.id, id));
    } else {
      await db().insert(experiments).values({ ...data, number: await nextExperimentNumber() });
    }
  } catch (err) {
    if (String(err).includes("unique")) return { error: `The URL /experiments/${data.slug} is already taken.` };
    throw err;
  }
  revalidatePath("/", "layout");
  redirect("/admin/experiments");
}

export async function setQuestionStatus(id: number, status: "approved" | "rejected" | "pending") {
  await requireOwner();
  await db().update(questions).set({ status }).where(eq(questions.id, id));
  revalidatePath("/questions");
  revalidatePath("/");
}

export async function deleteQuestion(id: number) {
  await requireOwner();
  await db().delete(questions).where(eq(questions.id, id));
  revalidatePath("/questions");
}

/** Turns a question into a new experiment (stage 1), credited to whoever asked. */
export async function promoteQuestion(id: number) {
  await requireOwner();
  const [q] = await db().select().from(questions).where(eq(questions.id, id)).limit(1);
  if (!q) return;
  const number = await nextExperimentNumber();
  const [exp] = await db()
    .insert(experiments)
    .values({
      number,
      slug: `${slugify(q.text, 50)}-${number}`,
      title: q.text,
      question: q.text,
      stage: 1,
      status: "running",
      askedBy: q.source === "reader" ? q.askerName || "a reader" : null,
      startedOn: new Date().toISOString().slice(0, 10),
      isPublic: false,
    })
    .returning({ id: experiments.id });
  await db().update(questions).set({ status: "promoted", experimentId: exp.id }).where(eq(questions.id, id));
  redirect(`/admin/experiments/${exp.id}`);
}

export async function addOwnerQuestion(form: FormData) {
  await requireOwner();
  const value = String(form.get("text") ?? "").trim().slice(0, 280);
  if (value.length < 3) return;
  await db().insert(questions).values({ text: value, source: "owner", status: "approved" });
  revalidatePath("/questions");
  revalidatePath("/admin/questions");
}
