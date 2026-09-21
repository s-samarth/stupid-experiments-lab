import { ExperimentCard } from "@/components/lab/ExperimentCard";
import { LoopStrip } from "@/components/lab/LoopStrip";
import { PostRow } from "@/components/lab/PostRow";
import { QuestionNote } from "@/components/lab/QuestionNote";
import { SectionRule } from "@/components/lab/SectionRule";
import { listActiveExperiments, getLabRecord } from "@/lib/queries/experiments";
import { listFindings, listLivePosts } from "@/lib/queries/posts";
import { listOpenQuestions } from "@/lib/queries/questions";
import { site } from "@/lib/site";

// Render on every request so read counts and the bench stay current.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Independent queries run in parallel instead of one after another.
  const [bench, findings, latest, open, record] = await Promise.all([
    listActiveExperiments(),
    listFindings(5),
    listLivePosts({ limit: 5 }),
    listOpenQuestions(3),
    getLabRecord(),
  ]);
  const writing = findings.length > 0 ? findings : latest;
  const failedUsefully = record.busted + record.inconclusive;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      <section className="relative pt-10 pb-8 sm:pt-14">
        <p className="mb-3 font-mono text-[12px] text-muted">
          Notebook Nº {site.notebookNumber} · {record.total} experiments, {failedUsefully} failed usefully
        </p>
        <h1 className="max-w-[34rem] font-serif text-[38px] leading-[1.08] sm:text-[44px]">
          I try things so I understand them. <em>Then I write down what broke.</em>
        </h1>
        <p className="font-hand text-[22px] leading-none text-pen sm:absolute sm:top-16 sm:right-4 sm:max-w-40 sm:rotate-3 max-sm:mt-4">
          most of these are stupid. that&apos;s the point.
        </p>
        <div className="mt-7">
          <LoopStrip />
        </div>
      </section>

      {bench.length > 0 && (
        <section aria-labelledby="bench" className="pb-6">
          <SectionRule label="On the bench now" aside={`${bench.length} active`} />
          <div className="grid gap-3 pt-3 sm:grid-cols-3">
            {bench.map((e, i) => (
              <ExperimentCard key={e.id} experiment={e} index={i} />
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-8 border-t border-ink pt-2.5 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          <h2 className="pb-1 font-mono text-[12px]">{findings.length > 0 ? "Findings" : "Latest"}</h2>
          {writing.length === 0 ? (
            <p className="py-4 font-serif text-muted italic">Nothing published yet. The lab is still setting up its beakers.</p>
          ) : (
            <ul>
              {writing.map((p) => (
                <PostRow key={p.id} post={p} />
              ))}
            </ul>
          )}
        </div>
        <aside aria-label="Question box">
          <h2 className="pb-2 font-mono text-[12px]">Question box</h2>
          <QuestionNote questions={open.questions} total={open.total} />
        </aside>
      </section>
    </div>
  );
}
