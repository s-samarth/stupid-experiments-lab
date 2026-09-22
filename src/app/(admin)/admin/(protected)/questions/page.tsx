import Link from "next/link";
import { QuestionBucket } from "@/components/admin/QuestionBucket";
import { addOwnerQuestion } from "@/lib/admin/question-actions";
import { listQuestionsForReview } from "@/lib/admin/queries";

/**
 * The question box, sorted into buckets. Reader questions land in the inbox and
 * stay private until you put them on the public board.
 */
export default async function AdminQuestionsPage() {
  const all = await listQuestionsForReview();
  const by = (status: (typeof all)[number]["status"]) => all.filter((q) => q.status === status);
  const rejected = by("rejected");

  return (
    <main className="mx-auto max-w-4xl px-5 py-8">
      <h1 className="font-serif text-[28px]">Question box</h1>
      <ol className="mt-2 grid gap-1 text-[14px] text-muted sm:grid-cols-3 sm:gap-4">
        <li>
          <b className="font-medium text-ink">1. Readers ask</b> on{" "}
          <Link href="/questions" target="_blank" className="text-pen hover:underline">/questions ↗</Link>. It lands in your inbox, private.
        </li>
        <li><b className="font-medium text-ink">2. You pick</b>: put it on the public board, or reject it.</li>
        <li><b className="font-medium text-ink">3. Write about it</b> starts a post with the question filled in.</li>
      </ol>

      <QuestionBucket
        title="Inbox"
        hint="private · only you see these"
        questions={by("pending")}
        actions={["approve", "write", "reject"]}
        empty="Nothing new. When a reader asks a question, it shows up here."
      />
      <QuestionBucket
        title="On the public board"
        hint="everyone sees these at /questions"
        questions={by("approved")}
        actions={["write", "unpublish"]}
        empty="The board is empty. Add your own question above, or put one up from the inbox."
      >
        <form action={addOwnerQuestion} className="mt-3 flex gap-2">
          <label htmlFor="new-q" className="sr-only">Add a question to the board</label>
          <input id="new-q" name="text" required minLength={3} maxLength={280} placeholder="Add your own question to the board…" className="flex-1 rounded-note border border-line bg-card px-3 py-2 font-serif text-[17px] focus:border-ink focus:outline-none" />
          <button type="submit" className="rounded-note bg-ink px-4 text-[14px] text-paper">Add to board</button>
        </form>
      </QuestionBucket>
      <QuestionBucket
        title="Written up"
        hint="shown publicly once the post is live"
        questions={by("promoted")}
        actions={["restore", "delete"]}
        empty={'No questions have become posts yet. Use "Write about it" on any question.'}
      />
      {rejected.length > 0 && (
        <details className="mt-2">
          <summary className="mt-8 cursor-pointer font-mono text-[12px] text-muted">Rejected · {rejected.length}</summary>
          <QuestionBucket title="Rejected" hint="hidden from everyone" questions={rejected} actions={["restore", "delete"]} empty="" />
        </details>
      )}
    </main>
  );
}
