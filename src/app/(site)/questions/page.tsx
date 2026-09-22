import type { Metadata } from "next";
import Link from "next/link";
import { listPublicQuestions } from "@/lib/queries/questions";
import { AskForm } from "./AskForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Question box",
  description: "Questions waiting to be tested. Suggest one.",
};

const TILTS = ["rotate-1", "-rotate-1", "rotate-[0.4deg]", "-rotate-[0.6deg]"];

export default async function QuestionsPage() {
  const all = await listPublicQuestions();
  const open = all.filter((q) => q.status === "approved");
  // Only questions whose post is already live count as "written up".
  const tested = all.filter((q) => q.status === "promoted" && q.postSlug);

  return (
    <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8">
      <h1 className="font-serif text-[36px] leading-tight">Question box</h1>
      <p className="mt-2 max-w-xl font-serif text-[18px] text-muted">
        Things I want to understand but haven&apos;t tested yet. Some will turn into posts. Most will stay stupid.
      </p>

      <div className="mt-8 max-w-xl">
        <AskForm />
      </div>

      <section aria-labelledby="open-q" className="mt-12">
        <h2 id="open-q" className="border-t border-ink pt-2.5 font-mono text-[12px]">
          Waiting on the shelf · {open.length}
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {open.map((q, i) => (
            <li key={q.id} className={`rounded-[2px] bg-sticky px-4 py-3.5 ${TILTS[i % TILTS.length]}`}>
              <p className="font-hand text-[21px] leading-snug">{q.text}</p>
              {q.source === "reader" && (
                <p className="mt-2 font-mono text-[11px] text-muted">asked by {q.askerName || "a reader"}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {tested.length > 0 && (
        <section aria-labelledby="tested-q" className="mt-12">
          <h2 id="tested-q" className="border-t border-ink pt-2.5 font-mono text-[12px]">
            Written up · {tested.length}
          </h2>
          <ul className="mt-3">
            {tested.map((q) => (
              <li key={q.id} className="border-b border-line py-3">
                <span className="font-serif text-[18px] line-through decoration-line-strong">{q.text}</span>{" "}
                <Link href={`/p/${q.postSlug}`} className="ink-link font-mono text-[12px]">
                  → read the post
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
