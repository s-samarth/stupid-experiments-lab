import { Fragment } from "react";
import { LOOP_STAGES } from "@/lib/loop";

/** Condensed stages shown on the home page; the full nine live on experiment pages. */
const STRIP = [1, 3, 4, 5, 7, 9];

/** Horizontal "the loop" strip. `highlight` marks one stage (e.g. the most common active one). */
export function LoopStrip({ highlight = 5 }: { highlight?: number }) {
  const stages = LOOP_STAGES.filter((s) => STRIP.includes(s.n));
  return (
    <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[12px]" aria-label="The experiment loop">
      <li className="mr-1 text-muted" aria-hidden>
        the loop →
      </li>
      {stages.map((s, i) => (
        <Fragment key={s.key}>
          {i > 0 && (
            <li className="text-muted" aria-hidden>
              ·
            </li>
          )}
          <li
            title={s.blurb}
            className={
              s.n === highlight
                ? "rounded-full border border-ink bg-amber-soft px-2 py-0.5"
                : "rounded-full border border-line-strong px-2 py-0.5"
            }
          >
            {s.label}
          </li>
        </Fragment>
      ))}
      <li className="ml-1 font-hand text-xl leading-none text-red" aria-hidden>
        ↺
      </li>
    </ol>
  );
}
