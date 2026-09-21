import Link from "next/link";
import { author, site } from "@/lib/site";
import { Icon } from "./Icon";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 max-w-5xl border-t border-line px-5 py-5 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 text-muted">
        <p className="font-mono text-[12px]">
          {site.location} · <Link href="/rss.xml" className="ink-link">RSS</Link> · no newsletter, no pop-ups
        </p>
        <ul className="flex items-center gap-4">
          {author.socials.map((s) => (
            <li key={s.href}>
              <a href={s.href} className="transition-colors hover:text-ink" target="_blank" rel="noreferrer">
                <Icon name={s.icon} size={17} label={s.label} />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
