import { LOOP_STAGES } from "@/lib/loop";

type LoopTrackerProps = {
  /** The stage the experiment has reached (1–9). */
  current: number;
  /** Optional: the stage this particular post is about, marked "you are here". */
  here?: number | null;
};

/** Vertical nine-step tracker for the side of experiment and post pages. */
export function LoopTracker({ current, here }: LoopTrackerProps) {
  const pointer = here ?? current;
  return (
    <div>
      <p className="mb-3 font-mono text-[11px] text-muted">the loop</p>
      <ol className="flex flex-col gap-1.5 text-[13px]">
        {LOOP_STAGES.map((s) => {
          const isHere = s.n === pointer;
          const done = s.n < current;
          const dot = isHere
            ? "border-ink bg-amber text-ink"
            : done
              ? "border-ink bg-ink text-paper"
              : s.n === current
                ? "border-ink bg-amber-soft text-ink"
                : "border-line-strong bg-paper text-muted";
          return (
            <li
              key={s.key}
              title={s.blurb}
              aria-current={isHere ? "step" : undefined}
              className={`flex items-center gap-2 ${isHere ? "font-medium" : done ? "" : "text-muted"}`}
            >
              <span className={`flex size-5 items-center justify-center rounded-full border font-mono text-[10px] ${dot}`}>
                {s.n}
              </span>
              {s.label}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 font-hand text-lg leading-tight text-pen">you are here ↑</p>
    </div>
  );
}
