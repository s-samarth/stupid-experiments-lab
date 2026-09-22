/**
 * Owner-only authentication. GitHub OAuth, and the sign-in callback rejects
 * every GitHub account except OWNER_GITHUB_LOGIN. Readers never sign in.
 * Sessions are stateless JWT cookies, so no auth tables are needed.
 */
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { redirect } from "next/navigation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: { signIn: "/admin/login", error: "/admin/login" },
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
  callbacks: {
    signIn({ profile }) {
      const owner = process.env.OWNER_GITHUB_LOGIN?.toLowerCase();
      return Boolean(owner && typeof profile?.login === "string" && profile.login.toLowerCase() === owner);
    },
  },
});

/**
 * Local development only: `DEV_OWNER=1 npm run dev` treats you as signed in, so
 * the admin can be tested without a GitHub round trip. Next.js sets NODE_ENV to
 * "production" for every build it deploys, so this can never apply to the live site.
 */
const devOwner = process.env.NODE_ENV === "development" && process.env.DEV_OWNER === "1";

/** True when the current request comes from the signed-in owner. */
export async function isOwner(): Promise<boolean> {
  if (devOwner) return true;
  const session = await auth();
  return Boolean(session?.user);
}

/**
 * Call at the top of every admin page and server action. Server actions are
 * public HTTP endpoints under the hood, so each one must check for itself.
 */
export async function requireOwner(): Promise<void> {
  if (!(await isOwner())) redirect("/admin/login");
}
