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
/** Wide layout: where each man stands, and where his label sits (clear of the trail). */
const WIDE: Record<string, { at: [number, number]; label: [number, number, Anchor] }> = {
  question: { at: [70, 300], label: [70, 326, "middle"] },
  clarify: { at: [195, 240], label: [195, 140, "middle"] },
  research: { at: [320, 190], label: [320, 90, "middle"] },
  hypothesis: { at: [450, 150], label: [478, 112, "start"] },
  experiment: { at: [590, 230], label: [578, 256, "end"] },
  log: { at: [580, 540], label: [580, 566, "middle"] },
  findings: { at: [432, 470], label: [440, 370, "middle"] },
  reflect: { at: [310, 390], label: [310, 280, "middle"] },
  next: { at: [178, 450], label: [180, 476, "middle"] },
};
const WIDE_NOTES: Record<string, [number, number, number]> = { hypothesis: [372, 62, -6], log: [384, 562, 3] };
const WIDE_TRAIL =
  "M36 300 H70 C120 300 150 240 195 240 C245 240 275 190 320 190 C370 190 400 150 450 150 C500 150 540 230 590 230 " +
  "C670 230 670 540 580 540 C520 540 490 470 440 470 C390 470 360 390 310 390 C260 390 230 450 180 450 C130 450 60 440 0 440";

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
    <div className="journey mx-auto max-w-[760px]">
      <svg viewBox="0 0 680 610" className="hidden w-full sm:block" role="img" aria-labelledby="journey-title">
        <title id="journey-title">One man walking a trail of ups and downs through the nine steps, from a question to the next question</title>
        <path className="j-trail" d={WIDE_TRAIL} />
        <circle className="j-dot" cx="36" cy="300" r="3" />
        <text className="j-mono" x="30" y="288" textAnchor="middle">start</text>
        {LOOP_STAGES.map((s) => {
          const { at, label } = WIDE[s.key];
          const note = NOTES[s.key];
          const notePos = WIDE_NOTES[s.key];
          return (
            <g key={s.key}>
              <g transform={`translate(${at[0]} ${at[1]})`}>{FIGURES[s.key]}</g>
              <Label n={s.n} title={s.label} blurb={BLURBS[s.key]} x={label[0]} y={label[1]} anchor={label[2]} />
              {note && notePos && (
                <text className={`j-hand ${note.className}`} fontSize="18" x={notePos[0]} y={notePos[1]} transform={`rotate(${notePos[2]} ${notePos[0]} ${notePos[1]})`}>
                  {note.text}
                </text>
              )}
            </g>
          );
        })}
        <g transform="translate(66 444)"><Signpost /></g>
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
