"use client";

import { useActionState } from "react";
import { saveExperiment, type ExperimentFormState } from "@/lib/admin/experiment-actions";
import type { Experiment } from "@/lib/db/schema";
import { EXPERIMENT_STATUSES, LOOP_STAGES, VERDICTS, experimentCode } from "@/lib/loop";

type Props = {
  experiment: Experiment | null;
  others: { id: number; number: number; title: string }[];
};

const label = "mb-1 block text-[12px] text-muted";
const field = "w-full rounded-note border border-line bg-card px-3 py-2 text-[14px] focus:border-ink focus:outline-none";

export function ExperimentForm({ experiment: e, others }: Props) {
  const action = saveExperiment.bind(null, e?.id ?? null);
  const [state, formAction, pending] = useActionState<ExperimentFormState, FormData>(action, null);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label className={label} htmlFor="title">Title</label>
        <input id="title" name="title" required defaultValue={e?.title} className={`${field} font-serif text-[20px]`} />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="question">The question</label>
        <textarea id="question" name="question" required rows={2} defaultValue={e?.question} className={field} />
      </div>
      <div className="sm:col-span-2">
        <label className={label} htmlFor="hypothesis">Hypothesis (something I could be wrong about)</label>
        <textarea id="hypothesis" name="hypothesis" rows={2} defaultValue={e?.hypothesis ?? ""} className={field} />
      </div>
      <Field name="measure" label="Measured by" value={e?.measure} />
      <Field name="killCriterion" label="Kill it if" value={e?.killCriterion} />

      <div>
        <label className={label} htmlFor="stage">Loop stage</label>
        <select id="stage" name="stage" defaultValue={e?.stage ?? 1} className={field}>
          {LOOP_STAGES.map((s) => <option key={s.n} value={s.n}>{s.n} · {s.label}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={e?.status ?? "running"} className={field}>
          {EXPERIMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="verdict">Verdict</label>
        <select id="verdict" name="verdict" defaultValue={e?.verdict ?? ""} className={field}>
          <option value="">Not yet</option>
          {VERDICTS.map((v) => <option key={v}>{v}</option>)}
        </select>
      </div>
      <Field name="scribble" label="Scribble (handwritten status on the card)" value={e?.scribble} placeholder="down 3.1%. hmm." />
      <Field name="startedOn" label="Started" value={e?.startedOn} type="date" />
      <Field name="endedOn" label="Ended" value={e?.endedOn} type="date" />
      <Field name="tags" label="Tags (comma separated)" value={e?.tags.join(", ")} />
      <div>
        <label className={label} htmlFor="spawnedFromId">Spawned from</label>
        <select id="spawnedFromId" name="spawnedFromId" defaultValue={e?.spawnedFromId ?? ""} className={field}>
          <option value="">Nothing, it&apos;s original</option>
          {others.filter((o) => o.id !== e?.id).map((o) => (
            <option key={o.id} value={o.id}>{experimentCode(o.number)} · {o.title}</option>
          ))}
        </select>
      </div>
      <Field name="slug" label="URL (/experiments/…)" value={e?.slug} placeholder="from the title" />
      <label className="flex items-center gap-2 self-end pb-2 text-[14px]">
        <input type="checkbox" name="isPublic" defaultChecked={e?.isPublic ?? true} /> Visible on the site
      </label>

      <div className="flex items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="rounded-note bg-ink px-5 py-2 text-[14px] text-paper disabled:opacity-60">
          {pending ? "Saving…" : e ? "Save experiment" : "Create experiment"}
        </button>
        {state?.error && <p role="alert" className="text-[13px] text-red">{state.error}</p>}
      </div>
    </form>
  );
}

function Field({ name, label: text, value, placeholder, type = "text" }: { name: string; label: string; value?: string | null; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className={label} htmlFor={name}>{text}</label>
      <input id={name} name={name} type={type} defaultValue={value ?? ""} placeholder={placeholder} className={field} />
    </div>
  );
}
