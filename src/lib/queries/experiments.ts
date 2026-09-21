/** Public read queries for experiments. */
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db, experiments, posts } from "@/lib/db";
import type { ExperimentStatus, Verdict } from "@/lib/loop";
import { isLive } from "./posts";

const entryCount = sql<number>`(SELECT count(*)::int FROM ${posts} WHERE ${posts.experimentId} = ${experiments.id} AND ${isLive})`;

export type ExperimentListItem = Awaited<ReturnType<typeof listExperiments>>[number];

type ExperimentFilter = { status?: ExperimentStatus; verdict?: Verdict; tag?: string };

export function listExperiments({ status, verdict, tag }: ExperimentFilter = {}) {
  const filters = [eq(experiments.isPublic, true)];
  if (status) filters.push(eq(experiments.status, status));
  if (verdict) filters.push(eq(experiments.verdict, verdict));
  if (tag) filters.push(sql`${tag} = ANY(${experiments.tags})`);
  return db()
    .select({
      id: experiments.id,
      number: experiments.number,
      slug: experiments.slug,
      title: experiments.title,
      question: experiments.question,
      stage: experiments.stage,
      status: experiments.status,
      verdict: experiments.verdict,
      scribble: experiments.scribble,
      tags: experiments.tags,
      startedOn: experiments.startedOn,
      endedOn: experiments.endedOn,
      entries: entryCount,
    })
    .from(experiments)
    .where(and(...filters))
    .orderBy(desc(experiments.number));
}

/** "On the bench": experiments still in progress. */
export function listActiveExperiments() {
  return listExperiments().then((rows) =>
    rows.filter((e) => e.status === "running" || e.status === "writing-up").slice(0, 3),
  );
}

/** Loads one public experiment (by slug or id) with its parent and children. */
export async function getExperiment(key: { slug: string } | { id: number }) {
  const match = "slug" in key ? eq(experiments.slug, key.slug) : eq(experiments.id, key.id);
  const rows = await db()
    .select()
    .from(experiments)
    .where(and(match, eq(experiments.isPublic, true)))
    .limit(1);
  const experiment = rows[0];
  if (!experiment) return null;

  const [parent, children] = await Promise.all([
    experiment.spawnedFromId ? getExperimentStub(experiment.spawnedFromId) : null,
    db()
      .select({ number: experiments.number, slug: experiments.slug, title: experiments.title })
      .from(experiments)
      .where(and(eq(experiments.spawnedFromId, experiment.id), eq(experiments.isPublic, true)))
      .orderBy(asc(experiments.number)),
  ]);
  return { experiment, parent, children };
}

async function getExperimentStub(id: number) {
  const rows = await db()
    .select({ number: experiments.number, slug: experiments.slug, title: experiments.title })
    .from(experiments)
    .where(and(eq(experiments.id, id), eq(experiments.isPublic, true)))
    .limit(1);
  return rows[0] ?? null;
}

/** Counts for the "lab record" card. */
export async function getLabRecord() {
  const rows = await db()
    .select({ verdict: experiments.verdict, status: experiments.status })
    .from(experiments)
    .where(eq(experiments.isPublic, true));
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
  return {
    total: rows.length,
    running: rows.filter((r) => r.status === "running").length,
    confirmed: count("confirmed"),
    busted: count("busted"),
    weird: count("weird"),
    inconclusive: count("inconclusive"),
  };
}
