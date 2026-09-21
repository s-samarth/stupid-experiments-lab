"use client";

/**
 * A client component: it needs `usePathname()`, which only exists in the browser.
 * Keeping it this small means the rest of the header still renders on the server.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = { href: string; children: React.ReactNode };

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`ink-link ${active ? "decoration-amber!" : ""}`}
    >
      {children}
    </Link>
  );
}
