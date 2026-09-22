import type { Metadata } from "next";
import { LabRecord } from "@/components/lab/LabRecord";
import { LoopExplainer } from "@/components/lab/LoopExplainer";
import { Icon } from "@/components/site/Icon";
import { getLabRecord } from "@/lib/queries/posts";
import { author } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: author.name, description: author.bio[0] };

const RULES = [
  "Curiosity should lead to action.",
  "Test ideas instead of just discussing them.",
  "A failed experiment is fine if I learn something from it.",
  "The process counts as much as the result.",
  "Writing is how I think, not content.",
  "Show evidence, not manufactured expertise.",
];

export default async function AboutPage() {
  const record = await getLabRecord();
  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
      <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <p className="font-mono text-[12px] text-muted">the person running this lab</p>
          <h1 className="mt-2 mb-4 font-serif text-[38px] leading-tight">{author.name}</h1>
          {author.bio.map((para) => (
            <p key={para} className="mb-3 font-serif text-[19px] leading-relaxed">
              {para}
            </p>
          ))}
          <p className="font-serif text-[19px] leading-relaxed italic">{author.labStatement}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {author.socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-[14px] hover:border-ink"
                >
                  <Icon name={s.icon} size={15} />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <LabRecord record={record} />
      </div>

      <section aria-labelledby="how" className="mt-14 border-t border-ink pt-2.5">
        <h2 id="how" className="font-mono text-[12px]">How every post works</h2>
        <div className="mt-5">
          <LoopExplainer />
        </div>
      </section>

      <section aria-labelledby="rules" className="mt-12 border-t border-ink pt-2.5">
        <h2 id="rules" className="font-mono text-[12px]">House rules</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {RULES.map((r) => (
            <li key={r} className="font-serif text-[18px]">
              — {r}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
