import Link from "next/link";
import { site } from "@/lib/site";
import { NavLink } from "./NavLink";

const NAV = [
  { href: "/experiments", label: "Experiments" },
  { href: "/writing", label: "Writing" },
  { href: "/questions", label: "Question box" },
  { href: "/stats", label: "Stats" },
  { href: "/about", label: "Samarth" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 pt-5 pb-3 sm:px-8">
      <Link href="/" className="font-mono text-[13px]">
        {site.name} <span className="text-muted">/ lab</span>
      </Link>
      <nav aria-label="Main" className="flex flex-wrap gap-x-5 gap-y-1 text-[14px]">
        {NAV.map((item) => (
          <NavLink key={item.href} href={item.href}>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
