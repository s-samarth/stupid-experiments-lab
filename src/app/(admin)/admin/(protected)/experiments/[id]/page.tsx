import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperimentForm } from "@/components/admin/ExperimentForm";
import { createPost } from "@/lib/admin/post-actions";
import { getExperimentForEdit, listExperimentOptions } from "@/lib/admin/queries";
import { experimentCode } from "@/lib/loop";

/** Handles both /admin/experiments/new and /admin/experiments/<id>. */
export default async function EditExperimentPage(props: PageProps<"/admin/experiments/[id]">) {
  const { id } = await props.params;
  const isNew = id === "new";
  const experimentId = Number(id);
  if (!isNew && !Number.isInteger(experimentId)) notFound();

  const [experiment, others] = await Promise.all([isNew ? null : getExperimentForEdit(experimentId), listExperimentOptions()]);
  if (!isNew && !experiment) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/admin/experiments" className="text-[13px] text-muted hover:text-ink">← Experiments</Link>
      <div className="mt-3 mb-6 flex items-center justify-between gap-4">
        <h1 className="font-serif text-[28px]">{experiment ? `${experimentCode(experiment.number)} · edit` : "New experiment"}</h1>
        {experiment && (
          <div className="flex gap-2">
            <Link href={`/experiments/${experiment.slug}`} target="_blank" className="rounded-note border border-line px-3 py-1.5 text-[13px] hover:border-ink">
              View ↗
            </Link>
            <form action={createPost.bind(null, experiment.id)}>
              <button type="submit" className="rounded-note bg-ink px-3 py-1.5 text-[13px] text-paper">New log entry</button>
            </form>
          </div>
        )}
      </div>
      <ExperimentForm experiment={experiment} others={others} />
    </main>
  );
}
