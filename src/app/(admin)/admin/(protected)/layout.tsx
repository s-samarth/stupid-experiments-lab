import type { Metadata } from "next";
import Link from "next/link";
import { requireOwner, signOut } from "@/auth";
import { pendingQuestionCount } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

/** Every page in this group requires the owner; the check runs on the server. */
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireOwner();
  const pending = await pendingQuestionCount();

  async function doSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  const link = "hover:text-ink";
  return (
    <div className="min-h-dvh bg-[#fbfaf6]">
      <header className="border-b border-line bg-paper">
        <nav aria-label="Admin" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-5 py-3 text-[14px] text-muted">
          <Link href="/admin" className="font-mono text-[13px] text-ink">
            lab admin
          </Link>
          <Link href="/admin" className={link}>Posts</Link>
          <Link href="/admin/questions" className={link}>
            Questions{pending > 0 && <span className="ml-1 rounded-full bg-amber px-1.5 font-mono text-[11px] text-ink">{pending}</span>}
          </Link>
          <Link href="/stats" className={link}>Stats</Link>
          <span className="flex-1" />
          <Link href="/" className={link}>View site ↗</Link>
          <form action={doSignOut}>
            <button type="submit" className={link}>Sign out</button>
          </form>
        </nav>
      </header>
      {children}
    </div>
  );
}
