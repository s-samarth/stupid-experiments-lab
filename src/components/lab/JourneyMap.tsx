import { LOOP_STAGES } from "@/lib/loop";
import { FIGURES, Signpost } from "./journey-figures";

/**
 * "How every piece is written": one stick man walking a trail of hills and
 * valleys through the nine stops. It's an illustration, not navigation, and
 * it deliberately doesn't close into a loop: the trail walks off the page.
 *
 * Pattern: two hand-placed SVG layouts, shown by breakpoint (`hidden sm:block`
 * / `sm:hidden`). A scaled-down wide drawing would make the text unreadable on
 * a phone, so the phone gets its own vertical arrangement of the same figures.
 */

const BLURBS: Record<string, string> = {
  question: "Something bugs me.",
  clarify: "What am I really asking?",
  research: "Who already knows?",
  hypothesis: "A guess I could lose.",
  experiment: "Actually try it.",
  log: "The mess, written down.",
  findings: "What really happened.",
  reflect: "What it changed in me.",
  next: "And off to the next one.",
};

/** The mood swings, written in the margin. */
const NOTES: Record<string, { text: string; className: string }> = {
  hypothesis: { text: "this might work!", className: "j-amber-text" },
  log: { text: "this is a disaster.", className: "j-red" },
};

type Anchor = "start" | "middle" | "end";
/**
 * Wide layout: one row, left to right. Where each man stands, and where his
 * label sits: above him on a hilltop, below him in a valley, so the trail
 * never runs through the text.
 */
const WIDE: Record<string, { at: [number, number]; label: [number, number, Anchor] }> = {
  question: { at: [55, 235], label: [20, 259, "start"] },
  clarify: { at: [159, 165], label: [159, 70, "middle"] },
  research: { at: [263, 235], label: [263, 259, "middle"] },
  hypothesis: { at: [367, 130], label: [367, 150, "middle"] },
  experiment: { at: [471, 130], label: [471, 30, "middle"] },
  log: { at: [575, 290], label: [575, 314, "middle"] },
  findings: { at: [679, 215], label: [679, 118, "middle"] },
  reflect: { at: [783, 150], label: [800, 92, "start"] },
  next: { at: [887, 215], label: [960, 239, "end"] },
};
/** x, y, rotation and anchor of the handwritten notes in the wide layout. */
const WIDE_NOTES: Record<string, [number, number, number, Anchor]> = { hypothesis: [248, 100, -6, "start"], log: [545, 296, 3, "end"] };

/** A smooth trail: flat under each man's feet, curving between stops. */
function wideTrail(): string {
  const stops = LOOP_STAGES.map((s) => WIDE[s.key].at);
  let d = `M22 ${stops[0][1]} H${stops[0][0]}`;
  for (let i = 1; i < stops.length; i++) {
    const [[x1, y1], [x2, y2]] = [stops[i - 1], stops[i]];
    const half = (x2 - x1) / 2;
    d += ` C${x1 + half} ${y1} ${x2 - half} ${y2} ${x2} ${y2}`;
  }
  return `${d} H1000`;
}

/** Phone layout: every man at x=100, one every STEP px; the trail swings out right, then left. */
const STEP = 130;
const TOP = 95;
const phoneY = (i: number) => TOP + i * STEP;
function phoneTrail(): string {
  let d = `M70 ${phoneY(0)} H130`;
  for (let i = 0; i < LOOP_STAGES.length - 1; i++) {
    const [y, y2] = [phoneY(i), phoneY(i + 1)];
    d += i % 2 === 0 ? ` C170 ${y} 170 ${y2} 130 ${y2} H70` : ` C30 ${y} 30 ${y2} 70 ${y2} H130`;
  }
  const last = phoneY(LOOP_STAGES.length - 1);
  return `${d} C200 ${last} 200 ${last + 70} 260 ${last + 70} H360`;
}

function Label({ n, title, blurb, x, y, anchor }: { n: number; title: string; blurb: string; x: number; y: number; anchor: Anchor }) {
  return (
    <>
      <text className="j-title" x={x} y={y} textAnchor={anchor}>
        <tspan className="j-mono">{String(n).padStart(2, "0")} </tspan>
        {title}
      </text>
      <text className="j-blurb" x={x} y={y + 17} textAnchor={anchor}>{blurb}</text>
    </>
  );
}

export function JourneyMap() {
  const phoneHeight = phoneY(LOOP_STAGES.length - 1) + 110;
  return (
    <div className="journey">
      <svg viewBox="0 0 1000 345" className="hidden w-full sm:block" role="img" aria-labelledby="journey-title">
        <title id="journey-title">One man walking a trail of ups and downs through the nine steps, from a question to the next question</title>
        <path className="j-trail" d={wideTrail()} />
        <circle className="j-dot" cx="22" cy="235" r="3" />
        <text className="j-mono" x="22" y="223" textAnchor="middle">start</text>
        {LOOP_STAGES.map((s) => {
          const { at, label } = WIDE[s.key];
          const note = NOTES[s.key];
          const notePos = WIDE_NOTES[s.key];
          return (
            <g key={s.key}>
              <g transform={`translate(${at[0]} ${at[1]})`}>{FIGURES[s.key]}</g>
              <Label n={s.n} title={s.label} blurb={BLURBS[s.key]} x={label[0]} y={label[1]} anchor={label[2]} />
              {note && notePos && (
                <text className={`j-hand ${note.className}`} fontSize="18" x={notePos[0]} y={notePos[1]} textAnchor={notePos[3]} transform={`rotate(${notePos[2]} ${notePos[0]} ${notePos[1]})`}>
                  {note.text}
                </text>
              )}
            </g>
          );
        })}
        <g transform="translate(950 215)"><Signpost flip /></g>
      </svg>

      <svg viewBox={`0 0 360 ${phoneHeight}`} className="w-full sm:hidden" role="img" aria-labelledby="journey-title-phone">
        <title id="journey-title-phone">One man walking a winding trail through the nine steps, from a question to the next question</title>
        <path className="j-trail" d={phoneTrail()} />
        <circle className="j-dot" cx="70" cy={phoneY(0)} r="3" />
        <text className="j-mono" x="58" y={phoneY(0) + 18} textAnchor="middle">start</text>
        {LOOP_STAGES.map((s, i) => {
          const y = phoneY(i);
          const note = NOTES[s.key];
          return (
            <g key={s.key}>
              <g transform={`translate(100 ${y})`}>{FIGURES[s.key]}</g>
              <Label n={s.n} title={s.label} blurb={BLURBS[s.key]} x={190} y={y - 44} anchor="start" />
              {note && <text className={`j-hand ${note.className}`} fontSize="17" x={190} y={y - 6}>{note.text}</text>}
            </g>
          );
        })}
        <g transform={`translate(290 ${phoneY(LOOP_STAGES.length - 1) + 70})`}><Signpost flip /></g>
      </svg>

      <p className="mt-3 font-hand text-[19px] leading-snug text-red">
        not a loop. every piece is its own trip, and the next question is where the next one starts.
      </p>
    </div>
  );
}
