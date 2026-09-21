import { addOwnerQuestion, deleteQuestion, promoteQuestion, setQuestionStatus } from "@/lib/admin/experiment-actions";
import { listQuestionsForReview } from "@/lib/admin/queries";
import { formatShortDate } from "@/lib/format";

const small = "rounded-note border border-line px-2.5 py-1 text-[12px] hover:border-ink";

export default async function AdminQuestionsPage() {
  const all = await listQuestionsForReview();
  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="font-serif text-[28px]">Question box</h1>

      <form action={addOwnerQuestion} className="mt-5 flex gap-2">
        <label htmlFor="new-q" className="sr-only">New question</label>
        <input id="new-q" name="text" required maxLength={280} placeholder="Capture a question before it escapes…" className="flex-1 rounded-note border border-line bg-card px-3 py-2 font-serif text-[17px] focus:border-ink focus:outline-none" />
        <button type="submit" className="rounded-note bg-ink px-4 text-[14px] text-paper">Add</button>
      </form>

      <ul className="mt-6 border-t border-ink">
        {all.length === 0 && <li className="py-8 text-center font-serif text-muted italic">Empty. Suspicious.</li>}
        {all.map((q) => (
          <li key={q.id} className={`flex flex-wrap items-center gap-3 border-b border-line py-3 ${q.status === "rejected" ? "opacity-50" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-[18px]">{q.text}</p>
              <p className="font-mono text-[11px] text-muted">
                {q.status} · {q.source === "reader" ? `from ${q.askerName || "a reader"}` : "mine"} · {formatShortDate(q.createdAt)}
              </p>
            </div>
            {/* Each button is its own tiny form bound to one action and one question. */}
            <div className="flex gap-1.5">
              {q.status !== "approved" && q.status !== "promoted" && (
                <form action={setQuestionStatus.bind(null, q.id, "approved")}><button className={small}>Approve</button></form>
              )}
              {q.status !== "promoted" && (
                <form action={promoteQuestion.bind(null, q.id)}><button className={`${small} bg-amber-soft`}>Make it an experiment</button></form>
              )}
              {q.status !== "rejected" && q.status !== "promoted" && (
                <form action={setQuestionStatus.bind(null, q.id, "rejected")}><button className={small}>Reject</button></form>
              )}
              <form action={deleteQuestion.bind(null, q.id)}><button className={`${small} text-red`}>Delete</button></form>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
