import Link from "next/link";
import { deleteQuestion, setQuestionStatus, writeAboutQuestion } from "@/lib/admin/question-actions";
import type { ReviewQuestion } from "@/lib/admin/queries";
import { formatShortDate } from "@/lib/format";

type Action = "approve" | "write" | "reject" | "unpublish" | "restore" | "delete";

type Props = {
  title: string;
  hint: string;
  questions: ReviewQuestion[];
  actions: Action[];
  empty: string;
};

const btn = "rounded-note border border-line px-2.5 py-1 text-[12px] hover:border-ink";

/** Button label and server action for each move a question can make. */
const MOVES: Record<Action, { label: string; className?: string; run: (id: number) => () => Promise<void> }> = {
  approve: { label: "Put on the board", className: "border-ink bg-amber-soft", run: (id) => setQuestionStatus.bind(null, id, "approved") },
  write: { label: "Write about it", run: (id) => writeAboutQuestion.bind(null, id) },
  unpublish: { label: "Take down", run: (id) => setQuestionStatus.bind(null, id, "pending") },
  restore: { label: "Back to inbox", run: (id) => setQuestionStatus.bind(null, id, "pending") },
  reject: { label: "Reject", run: (id) => setQuestionStatus.bind(null, id, "rejected") },
  delete: { label: "Delete", className: "text-red", run: (id) => deleteQuestion.bind(null, id) },
};

/**
 * One bucket of questions with the moves that make sense from it. Each button
 * is its own tiny <form> whose action is a server action with the question id
 * pre-filled by `bind`, so it works even before any JavaScript loads.
 */
export function QuestionBucket({ title, hint, questions, actions, empty }: Props) {
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-ink pb-1.5">
        <h2 className="font-mono text-[12px]">
          {title} · {questions.length}
        </h2>
        <p className="text-[12px] text-muted">{hint}</p>
      </div>
      <ul>
        {questions.length === 0 && <li className="py-5 font-serif text-muted italic">{empty}</li>}
        {questions.map((q) => (
          <li key={q.id} className="flex flex-wrap items-center gap-3 border-b border-line py-3">
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[18px]">{q.text}</p>
              <p className="font-mono text-[11px] text-muted">
                {q.source === "reader" ? `from ${q.askerName || "a reader"}` : "mine"} · {formatShortDate(q.createdAt)}
                {q.postId && (
                  <>
                    {" · "}
                    <Link href={`/admin/posts/${q.postId}`} className="text-pen hover:underline">
                      {q.postTitle || "untitled post"} ({q.postStatus})
                    </Link>
                  </>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {actions.map((a) => (
                <form key={a} action={MOVES[a].run(q.id)}>
                  <button className={`${btn} ${MOVES[a].className ?? ""}`}>{MOVES[a].label}</button>
                </form>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
