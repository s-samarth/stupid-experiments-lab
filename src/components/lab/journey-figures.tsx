/**
 * The stick man at each stop of the journey, drawn around his feet at (0, 0).
 * Drawing relative to the feet means the same figure can be placed anywhere
 * with a single `translate`, in both the wide and the phone layout.
 * Colours and fonts come from the `.journey` classes in lab.css.
 */
import type { ReactNode } from "react";

/** Standing body: body, legs, then the arm strokes that give each pose. */
const stand = (arms: string) => <path className="j-ink" d={`M0 -55 V-26 M0 -26 L-8 0 M0 -26 L8 0 ${arms}`} />;
const head = (y = -62) => <circle className="j-ink" cx="0" cy={y} r="7" />;

export const FIGURES: Record<string, ReactNode> = {
  question: (
    <>
      {head()}
      {stand("M0 -46 L-10 -30 M0 -46 L9 -40 L4 -54")}
      <text className="j-hand j-red" x="14" y="-74" fontSize="34">?</text>
    </>
  ),
  clarify: (
    <>
      {head()}
      {stand("M0 -46 L-9 -30 M0 -46 L12 -48")}
      <circle className="j-pen-stroke" cx="20" cy="-54" r="7" />
      <path className="j-pen-stroke" strokeWidth="2.5" d="M15 -49 L11 -46" />
    </>
  ),
  research: (
    <>
      {head()}
      {stand("M0 -46 L-10 -36 M0 -46 L10 -36")}
      <path className="j-ink j-fill-amber" strokeWidth="1.4" d="M-14 -40 L0 -36 L14 -40 L14 -28 L0 -24 L-14 -28 Z M0 -36 V-24" />
    </>
  ),
  hypothesis: (
    <>
      <circle className="j-bulb" cx="0" cy="-94" r="8" />
      <rect className="j-amber-fill" x="-4" y="-86" width="8" height="5" rx="1" />
      <path className="j-amber-stroke" d="M0 -109 V-114 M14 -100 L18 -103 M-14 -100 L-18 -103" />
      {head()}
      {stand("M0 -46 L-10 -30 M0 -46 L11 -58")}
    </>
  ),
  experiment: (
    <>
      {head()}
      {stand("M0 -46 L-9 -30 M0 -46 L13 -38")}
      <path className="j-flask" d="M15 -54 V-47 L8 -33 H28 L21 -47 V-54 Z" />
      <circle className="j-pen-stroke" strokeWidth="1.3" cx="20" cy="-63" r="2" />
      <circle className="j-pen-stroke" strokeWidth="1.3" cx="25" cy="-71" r="2.8" />
    </>
  ),
  log: (
    <>
      {head()}
      {stand("M0 -46 L-12 -36 M0 -46 L-10 -30")}
      <rect className="j-ink j-fill-card" strokeWidth="1.4" x="-28" y="-44" width="15" height="19" rx="1.5" transform="rotate(-10 -21 -35)" />
      <path className="j-muted-stroke" d="M-25 -38 H-17 M-25 -34 H-18 M-24 -30 H-19" />
    </>
  ),
  findings: (
    <>
      {head()}
      {stand("M0 -46 L-9 -30 M0 -46 L17 -50")}
      <rect className="j-pen-fill" x="22" y="-16" width="7" height="16" />
      <rect className="j-pen-fill" x="32" y="-26" width="7" height="26" />
      <rect className="j-pen-fill" x="42" y="-10" width="7" height="10" />
      <g transform="rotate(-8 36 -41)">
        <rect className="j-red-stroke" x="12" y="-49" width="48" height="16" rx="2" />
        <text className="j-mono j-red" x="36" y="-37" textAnchor="middle">BUSTED</text>
      </g>
    </>
  ),
  reflect: (
    <>
      <ellipse className="j-rock" cx="2" cy="-5" rx="18" ry="8" />
      {head(-54)}
      <path className="j-ink" d="M0 -47 V-18 M0 -18 H16 V0 M0 -18 H12 V0 M0 -38 L9 -26 L11 -42" />
      <circle className="j-muted-stroke" cx="-14" cy="-60" r="2" />
      <circle className="j-muted-stroke" cx="-21" cy="-67" r="3" />
      <text className="j-hand j-muted" x="-60" y="-70" fontSize="19">hmm.</text>
    </>
  ),
  next: (
    <>
      {head()}
      {/* Mid-stride: he's leaving. */}
      <path className="j-ink" d="M0 -55 L-2 -26 M-2 -26 L9 0 M-2 -26 L-14 -2 M-1 -46 L10 -32 M-1 -46 L-13 -34" />
      <text className="j-hand j-pen" x="-32" y="-64" fontSize="26">?</text>
    </>
  ),
};

/** The "next piece" signpost, centred on its post at (0, 0) = where it meets the ground. */
export function Signpost({ flip = false }: { flip?: boolean }) {
  // Wide layout points left (the trail exits left); the phone layout points down-right.
  const board = flip ? "M-42 -54 H30 L40 -45 L30 -36 H-42 Z" : "M42 -54 H-30 L-40 -45 L-30 -36 H42 Z";
  return (
    <>
      <path className="j-post" d="M0 -36 V0" />
      <path className="j-ink j-fill-card" strokeWidth="1.3" d={board} />
      <text className="j-mono j-ink-text" x={flip ? -4 : 2} y="-41" textAnchor="middle">next piece</text>
    </>
  );
}
