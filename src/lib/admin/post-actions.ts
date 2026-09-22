"use server";

/**
 * Owner-only server actions for writing, publishing and deleting posts.
 *
 * Lifecycle: "New post" opens the editor without touching the database. The
 * first autosave that has real content creates the draft (createDraft), later
 * saves update it (savePost). An empty post is never stored.
 */
import { and, eq, lt, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/auth";
import { db, posts } from "@/lib/db";
import { renderPost } from "@/lib/editor/render";
import { pingIndexNow } from "@/lib/seo/indexnow";
import { draftSlug, isDraftSlug, slugify } from "@/lib/slug";

const optionalText = z.string().trim().max(300).nullable().transform((v) => v || null);

const PostInput = z.object({
  title: z.string().trim().max(200),
  subtitle: optionalText,
  body: z.object({ type: z.literal("doc") }).passthrough(),
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, "Slugs use lowercase letters, numbers and dashes."),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(8),
  seoTitle: optionalText,
  seoDescription: optionalText,
  socialImage: optionalText,
});
export type PostInput = z.input<typeof PostInput>;

export type SaveResult = { ok: true; slug: string; savedAt: string } | { ok: false; error: string };
export type CreateResult = { ok: true; id: number | null } | { ok: false; error: string };

/** Parses the editor's snapshot and renders it; `empty` means there's nothing worth keeping. */
function prepare(input: PostInput) {
  const parsed = PostInput.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0].message };
  const { slug, ...data } = parsed.data;
  const rendered = renderPost(data.body);
  const values = { ...data, bodyHtml: rendered.html, readingMinutes: rendered.readingMinutes, verdict: rendered.verdict };
  const empty = !data.title && !data.subtitle && !rendered.html;
  return { ok: true as const, slug, values, empty };
}

/** First save of a new post. Returns `id: null` (and stores nothing) while the post is still empty. */
export async function createDraft(input: PostInput): Promise<CreateResult> {
  await requireOwner();
  const p = prepare(input);
  if (!p.ok) return { ok: false, error: p.error };
  if (p.empty) return { ok: true, id: null };
  const [row] = await db().insert(posts).values({ ...p.values, slug: draftSlug() }).returning({ id: posts.id });
  revalidatePath("/admin");
  return { ok: true, id: row.id };
}

export async function savePost(id: number, input: PostInput): Promise<SaveResult> {
  await requireOwner();
  const p = prepare(input);
  if (!p.ok) return { ok: false, error: p.error };

  // An empty slug field means "keep the current URL".
  if (p.slug) {
    const clash = await db().select({ id: posts.id }).from(posts).where(and(eq(posts.slug, p.slug), ne(posts.id, id))).limit(1);
    if (clash.length > 0) return { ok: false, error: `Another post already uses /p/${p.slug}.` };
  }

  const [row] = await db()
    .update(posts)
    .set({ ...p.values, ...(p.slug ? { slug: p.slug } : {}) })
    .where(eq(posts.id, id))
    .returning({ slug: posts.slug, status: posts.status });
  if (!row) return { ok: false, error: "This post no longer exists." };

  if (row.status !== "draft") revalidatePublic(row.slug);
  return { ok: true, slug: row.slug, savedAt: new Date().toISOString() };
}

/**
 * Publishes now, schedules for later, or backdates. A time in the future
 * becomes "scheduled"; the site shows it automatically once that time passes.
 */
export async function publishPost(id: number, when: string | null): Promise<SaveResult> {
  await requireOwner();
  const [post] = await db().select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return { ok: false, error: "This post no longer exists." };
  if (!post.title.trim()) return { ok: false, error: "Give it a title before publishing." };
  if (!post.bodyHtml) return { ok: false, error: "There's nothing in the post yet." };

  const at = when ? new Date(when) : (post.publishedAt ?? new Date());
  if (Number.isNaN(at.getTime())) return { ok: false, error: "That date doesn't look right." };
  const slug = isDraftSlug(post.slug) ? await uniqueSlug(slugify(post.title), id) : post.slug;

  await db()
    .update(posts)
    .set({ slug, publishedAt: at, status: at.getTime() > Date.now() ? "scheduled" : "published" })
    .where(eq(posts.id, id));
  revalidatePublic(slug);
  // Tell search engines now (after the response, so publishing isn't slowed down).
  // A scheduled post isn't live yet, so it's left to the sitemap.
  if (at.getTime() <= Date.now()) after(() => pingIndexNow([`/p/${slug}`, "/writing"]));
  return { ok: true, slug, savedAt: new Date().toISOString() };
}

/** Takes a post off the site and back to drafts. Its content is kept. */
export async function unpublishPost(id: number): Promise<void> {
  await requireOwner();
  const [row] = await db().update(posts).set({ status: "draft" }).where(eq(posts.id, id)).returning({ slug: posts.slug });
  if (row) revalidatePublic(row.slug);
  if (row) after(() => pingIndexNow([`/p/${row.slug}`]));
}

/** Deletes a post for good (its read stats go with it). Returns to the posts list. */
export async function deletePost(id: number): Promise<void> {
  await requireOwner();
  const [row] = await db().delete(posts).where(eq(posts.id, id)).returning({ slug: posts.slug });
  if (row) revalidatePublic(row.slug);
  redirect("/admin");
}

/**
 * Removes drafts with no title, subtitle or content that haven't been touched
 * for 10 minutes (so a draft you're emptying in another tab isn't pulled away).
 */
export async function deleteEmptyDrafts(): Promise<number> {
  await requireOwner();
  const rows = await db()
    .delete(posts)
    .where(
      and(
        eq(posts.status, "draft"),
        eq(posts.title, ""),
        eq(posts.bodyHtml, ""),
        sql`coalesce(${posts.subtitle}, '') = ''`,
        lt(posts.updatedAt, sql`now() - interval '10 minutes'`),
      ),
    )
    .returning({ id: posts.id });
  return rows.length;
}

async function uniqueSlug(base: string, id: number): Promise<string> {
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await db().select({ id: posts.id }).from(posts).where(and(eq(posts.slug, candidate), ne(posts.id, id))).limit(1);
    if (taken.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/** Clears cached pages that might show this post, including the admin list. */
function revalidatePublic(slug: string) {
  for (const path of ["/", "/writing", "/questions", "/stats", "/admin", `/p/${slug}`]) revalidatePath(path);
}
