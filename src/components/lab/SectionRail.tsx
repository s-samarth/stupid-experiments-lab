"use client";

import { useEffect, useState } from "react";

type Section = { id: string; title: string };

/**
 * The post's own sections, numbered, with the one you're reading highlighted.
 * Pattern: a scroll listener batched with requestAnimationFrame (at most one
 * measurement per frame) picks the last heading that has scrolled past the top
 * third of the screen. Each item is a real link to its section.
 */
export function SectionRail({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current = 0;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < line) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [sections]);

  return (
    <nav aria-label="Sections in this post">
      <p className="mb-3 font-mono text-[11px] text-muted">the loop</p>
      <ol className="flex flex-col gap-1.5 text-[13px]">
        {sections.map((s, i) => {
          const dot =
            i === active ? "border-ink bg-amber text-ink" : i < active ? "border-ink bg-ink text-paper" : "border-line-strong bg-paper text-muted";
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={i === active ? "location" : undefined}
                className={`group flex items-center gap-2 ${i === active ? "font-medium" : i < active ? "" : "text-muted"}`}
              >
                <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${dot}`}>{i + 1}</span>
                <span className="group-hover:underline">{s.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
