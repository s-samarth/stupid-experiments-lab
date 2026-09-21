import Link from "next/link";
import { dayNumber } from "@/lib/format";
import { experimentCode, stageLabel } from "@/lib/loop";
import type { ExperimentListItem } from "@/lib/queries/experiments";

/** Tilts alternate so a row of cards looks pinned up by hand, not gridded by a machine. */
const TILTS = ["-rotate-[0.6deg]", "rotate-[0.5deg]", "-rotate-[0.3deg]"];

type Props = { experiment: ExperimentListItem; index?: number };

/** Index card for an experiment "on the bench". */
export function ExperimentCard({ experiment: e, index = 0 }: Props) {
  const day = e.status === "running" ? dayNumber(e.startedOn) : null;
  const meta = day ? `day ${day}` : e.status === "writing-up" ? "writing up" : stageLabel(e.stage);
  const progress = Math.round((e.stage / 9) * 100);

  return (
    <Link
      href={`/experiments/${e.slug}`}
      className={`group block rounded-note border border-line bg-card px-4 py-3.5 transition-transform hover:rotate-0 ${TILTS[index % TILTS.length]}`}
    >
      <p className="font-mono text-[11px] text-muted">
        {experimentCode(e.number)} · {meta}
      </p>
      <h3 className="ink-link mt-1.5 mb-3 font-serif text-[18px] leading-snug">{e.title}</h3>
      <div
        className="h-1 rounded-full bg-paper-deep"
        role="progressbar"
        aria-valuenow={e.stage}
        aria-valuemin={1}
        aria-valuemax={9}
        aria-label={`Loop stage ${e.stage} of 9`}
      >
        <div className="h-1 rounded-full bg-amber" style={{ width: `${progress}%` }} />
      </div>
      {e.scribble && <p className="mt-2 font-hand text-lg leading-tight text-pen">{e.scribble}</p>}
    </Link>
  );
}
