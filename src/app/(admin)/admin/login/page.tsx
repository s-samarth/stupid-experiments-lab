import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isOwner, signIn } from "@/auth";
import { Icon } from "@/components/site/Icon";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage(props: PageProps<"/admin/login">) {
  if (await isOwner()) redirect("/admin");
  const { error } = await props.searchParams;

  async function signInWithGitHub() {
    "use server";
    await signIn("github", { redirectTo: "/admin" });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm rotate-[-0.5deg] rounded-note border border-line bg-card p-6">
        <p className="font-mono text-[12px] text-muted">{site.name} / lab door</p>
        <h1 className="mt-2 font-serif text-[28px]">Staff only.</h1>
        <p className="mt-1 font-serif text-[17px] text-muted">Readers don&apos;t need an account. Just the one who breaks things.</p>
        {error && (
          <p role="alert" className="mt-4 rounded-note bg-amber-soft px-3 py-2 text-[14px]">
            That GitHub account isn&apos;t allowed in.
          </p>
        )}
        <form action={signInWithGitHub} className="mt-6">
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-note bg-ink px-4 py-2.5 text-[15px] text-paper">
            <Icon name="github" size={18} />
            Continue with GitHub
          </button>
        </form>
      </div>
    </main>
  );
}
