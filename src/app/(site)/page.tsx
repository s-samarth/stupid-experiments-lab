import { JourneyMap } from "@/components/lab/JourneyMap";
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
        <h1 className="max-w-[34rem] font-serif text-[40px] leading-[1.05] sm:text-[48px]">
          Dumb ideas, <em>actually tried.</em>
        </h1>
        <p className="mt-4 max-w-[34rem] font-serif text-[19px] leading-relaxed text-muted">
          I don&apos;t have money. I have AI, free time and a steady supply of ideas that probably shouldn&apos;t be tested. So I
          test them here, in public. Mine to think, mine to write, mine to break. No AI slop.
        </p>
        <div className="font-hand leading-[1.05] max-sm:mt-6 max-sm:space-y-2 sm:absolute sm:top-14 sm:right-2 sm:w-52">
          <p className="rotate-3 text-[22px] text-pen">one day I&apos;ll stop posting and you&apos;ll all know why.</p>
          <p className="-rotate-2 text-[20px] text-red sm:mt-6">either I&apos;ll be arrested or I&apos;ll be rich.</p>
        </div>
      </section>

      <section aria-label="How every piece is written" className="pb-12">
        <SectionRule label="How every piece is written" aside="one idea, nine stops, lots of ups and downs" />
        <div className="pt-6">
          <JourneyMap />
        </div>
      </section>

      <section className="grid gap-8 border-t border-ink pt-2.5 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div>
          <h2 className="pb-1 font-mono text-[12px]">What have I done so far?</h2>
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
