import { LoopExplainer } from "@/components/lab/LoopExplainer";
import { PostRow } from "@/components/lab/PostRow";
import { QuestionNote } from "@/components/lab/QuestionNote";
import { SectionRule } from "@/components/lab/SectionRule";
import { getLabRecord, listLivePosts } from "@/lib/queries/posts";
import { listOpenQuestions } from "@/lib/queries/questions";
import { site } from "@/lib/site";

// Render on every request so read counts stay current.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Independent queries run in parallel instead of one after another.
  const [latest, open, record] = await Promise.all([listLivePosts({ limit: 8 }), listOpenQuestions(3), getLabRecord()]);
  const failedUsefully = record.busted + record.inconclusive;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8">
      <section className="relative pt-10 pb-10 sm:pt-14">
        <p className="mb-3 font-mono text-[12px] text-muted">
          Notebook Nº {site.notebookNumber} · {record.total} {record.total === 1 ? "post" : "posts"}
          {failedUsefully > 0 && `, ${failedUsefully} failed usefully`}
        </p>
        <h1 className="max-w-[34rem] font-serif text-[38px] leading-[1.08] sm:text-[44px]">
          I try things so I understand them. <em>Then I write down what broke.</em>
        </h1>
        <p className="font-hand text-[22px] leading-none text-pen sm:absolute sm:top-16 sm:right-4 sm:max-w-40 sm:rotate-3 max-sm:mt-4">
          most of these are stupid. that&apos;s the point.
        </p>
      </section>

      <section aria-label="How I think" className="pb-12">
        <SectionRule label="How I think" aside="every post follows these steps, top to bottom" />
        <div className="pt-4">
          <LoopExplainer />
        </div>
      </section>

      <section className="grid gap-8 border-t border-ink pt-2.5 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          <h2 className="pb-1 font-mono text-[12px]">Latest</h2>
          {latest.length === 0 ? (
            <p className="py-4 font-serif text-muted italic">Nothing published yet. The lab is still setting up its beakers.</p>
          ) : (
            <ul>
              {latest.map((p) => (
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
