import Link from "next/link";

type Props = {
  questions: { id: number; text: string }[];
  total: number;
};

/** The yellow sticky note of unexplored questions on the home page. */
export function QuestionNote({ questions, total }: Props) {
  return (
    <div className="rotate-1 rounded-[2px] bg-sticky px-4 py-3.5">
      {questions.length === 0 ? (
        <p className="font-hand text-[20px] leading-snug">No open questions. Suspicious.</p>
      ) : (
        <ul className="space-y-2">
          {questions.map((q) => (
            <li key={q.id} className="font-hand text-[20px] leading-snug">
              {q.text}
            </li>
          ))}
        </ul>
      )}
      <Link href="/questions" className="ink-link mt-3 inline-block font-mono text-[11px] text-muted">
        {total > questions.length ? `${total} open questions` : "Ask one"} →
      </Link>
    </div>
  );
}
