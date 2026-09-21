import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HypothesisCard } from "@/components/lab/HypothesisCard";
import { LoopTracker } from "@/components/lab/LoopTracker";
import { PostRow } from "@/components/lab/PostRow";
import { SectionRule } from "@/components/lab/SectionRule";
import { Stamp } from "@/components/lab/Stamp";
import { dayNumber, formatDate } from "@/lib/format";
import { experimentCode } from "@/lib/loop";
import { getExperiment } from "@/lib/queries/experiments";
import { listExperimentEntries } from "@/lib/queries/posts";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/experiments/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await getExperiment({ slug });
  if (!found) return {};
  const { experiment: e } = found;
  return { title: `${experimentCode(e.number)} · ${e.title}`, description: e.question };
}

export default async function ExperimentPage(props: PageProps<"/experiments/[slug]">) {
  const { slug } = await props.params;
  const found = await getExperiment({ slug });
  if (!found) notFound();
  const { experiment: e, parent, children } = found;
  const entries = await listExperimentEntries(e.id);
  const day = e.status === "running" ? dayNumber(e.startedOn) : null;

  const meta = [
    experimentCode(e.number),
    e.startedOn ? `started ${formatDate(e.startedOn)}` : null,
    day ? `day ${day}` : null,
    e.endedOn ? `ended ${formatDate(e.endedOn)}` : null,
  ].filter(Boolean);

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-5 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[140px_minmax(0,680px)] lg:gap-12">
      <aside aria-label="Loop progress" className="order-last lg:order-first">
        <div className="lg:sticky lg:top-10">
          <LoopTracker current={e.stage} />
        </div>
      </aside>
      <div className="min-w-0">
        <p className="font-mono text-[12px] text-muted">{meta.join(" · ")}</p>
        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="font-serif text-[34px] leading-[1.1] text-balance sm:text-[40px]">{e.title}</h1>
          <Stamp verdict={e.verdict} status={e.status} className="mt-3 shrink-0" />
        </div>
        <p className="mt-3 font-serif text-[20px] leading-snug text-muted italic">{e.question}</p>
        {e.askedBy && <p className="mt-2 font-hand text-lg text-pen">asked by {e.askedBy} in the question box</p>}

        <div className="my-8">
          <HypothesisCard {...e} />
        </div>

        <section aria-labelledby="log">
          <SectionRule label="Lab log" aside={`${entries.length} ${entries.length === 1 ? "entry" : "entries"}`} />
          {entries.length === 0 ? (
            <p className="py-4 font-serif text-muted italic">No entries yet. Something is being set on fire as we speak.</p>
          ) : (
            <ol>
              {entries.map((post) => (
                <PostRow key={post.id} post={post} showStamp={false} showDate />
              ))}
            </ol>
          )}
        </section>

        {(parent || children.length > 0) && (
          <section aria-label="Lineage" className="mt-10 grid gap-3 sm:grid-cols-2">
            {parent && <LineageCard label="spawned from" item={parent} />}
            {children.map((c) => (
              <LineageCard key={c.slug} label="led to" item={c} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function LineageCard({ label, item }: { label: string; item: { number: number; slug: string; title: string } }) {
  return (
    <Link
      href={`/experiments/${item.slug}`}
      className="group block rounded-note border border-dashed border-line-strong px-4 py-3 hover:border-ink"
    >
      <p className="font-mono text-[11px] text-muted">{label}</p>
      <p className="ink-link mt-1 font-serif text-[17px]">
        {experimentCode(item.number)} · {item.title}
      </p>
    </Link>
  );
}
