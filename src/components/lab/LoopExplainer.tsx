import { LOOP_STAGES } from "@/lib/loop";

/**
 * The nine-step loop, drawn as plain numbered blocks. It's an explanation, not
 * navigation: nothing here is a link or a button, so nothing looks like one
 * (no pills, no borders around items, no hover states).
 */
export function LoopExplainer() {
  return (
    <div>
      <ol className="grid gap-x-8 gap-y-5 sm:grid-cols-3" aria-label="The loop every post follows">
        {LOOP_STAGES.map((s) => (
          <li key={s.key} className="border-t border-line pt-2.5">
            <p className="font-mono text-[11px] text-muted">
              {String(s.n).padStart(2, "0")}
              {s.n < LOOP_STAGES.length && <span aria-hidden> →</span>}
            </p>
            <p className="mt-0.5 font-serif text-[19px] leading-snug">{s.label}</p>
            <p className="text-[14px] leading-snug text-muted">{s.blurb}</p>
          </li>
        ))}
      </ol>
      <p className="mt-5 font-hand text-[21px] leading-none text-red">
        <span aria-hidden>↺ </span>then the next question starts it all over again.
      </p>
    </div>
  );
}
