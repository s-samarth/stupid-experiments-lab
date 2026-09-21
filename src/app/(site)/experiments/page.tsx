import type { Metadata } from "next";
import Link from "next/link";
import { FilterChips, param } from "@/components/lab/FilterChips";
import { Stamp } from "@/components/lab/Stamp";
import { EXPERIMENT_STATUSES, VERDICTS, experimentCode, stageLabel, type ExperimentStatus, type Verdict } from "@/lib/loop";
import { listExperiments } from "@/lib/queries/experiments";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Experiments" };

export default async function ExperimentsPage(props: PageProps<"/experiments">) {
  const sp = await props.searchParams;
  const current = { status: param(sp.status), verdict: param(sp.verdict), tag: param(sp.tag) };
  const status = EXPERIMENT_STATUSES.includes(current.status as ExperimentStatus) ? (current.status as ExperimentStatus) : undefined;
  const verdict = VERDICTS.includes(current.verdict as Verdict) ? (current.verdict as Verdict) : undefined;
  const all = await listExperiments({ status, verdict, tag: current.tag });

  return (
    <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-8">
      <h1 className="font-serif text-[36px] leading-tight">Experiments</h1>
      <p className="mt-2 max-w-xl font-serif text-[18px] text-muted">
        Every question I&apos;ve actually tried to answer, including the ones that went nowhere.
      </p>
      <div className="mt-6 space-y-2">
        <FilterChips basePath="/experiments" param="status" label="status" current={current} options={EXPERIMENT_STATUSES.map((s) => ({ value: s, label: s.replace("-", " ") }))} />
        <FilterChips basePath="/experiments" param="verdict" label="verdict" current={current} options={VERDICTS.map((v) => ({ value: v, label: v }))} />
      </div>
      {current.tag && (
        <p className="mt-3 text-[13px] text-muted">
          Tagged <span className="font-mono">{current.tag}</span> · <Link href="/experiments" className="ink-link">clear</Link>
        </p>
      )}

      <ol className="mt-6 border-t border-ink">
        {all.length === 0 && <li className="py-6 font-serif text-muted italic">No experiments match. Yet.</li>}
        {all.map((e) => (
          <li key={e.id} className="border-b border-line">
            <Link href={`/experiments/${e.slug}`} className="group grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-start gap-3 py-4">
              <span className="pt-1 font-mono text-[12px] text-muted">{experimentCode(e.number)}</span>
              <span>
                <span className="ink-link font-serif text-[20px] leading-snug">{e.title}</span>
                <span className="mt-1 block text-[13px] text-muted">
                  stage {e.stage} · {stageLabel(e.stage)} · {e.entries} {e.entries === 1 ? "entry" : "entries"}
                  {e.tags.length > 0 && ` · ${e.tags.join(", ")}`}
                </span>
              </span>
              <Stamp verdict={e.verdict} status={e.status} className="mt-1" />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
