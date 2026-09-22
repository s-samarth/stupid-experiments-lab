/** Plain-language explanation of how the numbers on /stats are counted. */
const POINTS = [
  {
    title: "A read",
    body: "When you open a post, your browser tells the site once. The same person opening the same post again on the same day still counts as one read.",
  },
  {
    title: "No cookies, no names",
    body: "To tell readers apart for the day, the server mixes your IP address and browser type with a secret and keeps only the scrambled result. The mix changes every day, so nobody (me included) can follow you from one day to the next. Your IP itself is never saved.",
  },
  {
    title: "Read depth",
    body: "As you scroll, the page notes when you pass 25%, 50%, 75% and the end of the post. Only the furthest point is kept.",
  },
  {
    title: "Where you came from",
    body: "The site you clicked from (LinkedIn, X, Google…) and your country, worked out from your connection. Apps like WhatsApp don't say where a click came from, so share links carry a small tag instead.",
  },
  {
    title: "What's left out",
    body: "Search engines and other bots, link previews, and my own visits while I'm signed in. Shares count clicks on the share buttons, not what happens after.",
  },
];

export function HowWeCount() {
  return (
    <section aria-labelledby="how-we-count" className="border-t border-ink pt-2.5">
      <h2 id="how-we-count" className="font-mono text-[12px]">
        How these numbers are counted
      </h2>
      <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.title}>
            <dt className="font-serif text-[18px]">{p.title}</dt>
            <dd className="mt-0.5 text-[14px] leading-relaxed text-muted">{p.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
