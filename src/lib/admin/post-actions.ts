"use server";

/** Owner-only server actions for writing, publishing and deleting posts. */
import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOwner } from "@/auth";
import { db, posts } from "@/lib/db";
import { renderPost } from "@/lib/editor/render";
import { draftSlug, isDraftSlug, slugify } from "@/lib/slug";

const optionalText = z.string().trim().max(300).nullable().transform((v) => v || null);

const PostInput = z.object({
  title: z.string().trim().max(200),
  subtitle: optionalText,
  body: z.object({ type: z.literal("doc") }).passthrough(),
  slug: z.string().trim().max(80).regex(/^[a-z0-9-]*$/, "Slugs use lowercase letters, numbers and dashes."),
  kind: z.enum(["log", "finding", "essay"]),
  experimentId: z.number().int().positive().nullable(),
  stage: z.number().int().min(1).max(9).nullable(),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(8),
  seoTitle: optionalText,
  seoDescription: optionalText,
  socialImage: optionalText,
});
export type PostInput = z.input<typeof PostInput>;

export type SaveResult = { ok: true; slug: string; savedAt: string } | { ok: false; error: string };

export async function createPost(experimentId?: number) {
  await requireOwner();
  const [row] = await db()
    .insert(posts)
    .values({ slug: draftSlug(), kind: experimentId ? "log" : "essay", experimentId: experimentId ?? null })
    .returning({ id: posts.id });
  redirect(`/admin/posts/${row.id}`);
}

export async function savePost(id: number, input: PostInput): Promise<SaveResult> {
  await requireOwner();
  const parsed = PostInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;

  // An empty slug field means "keep the current URL".
  const { slug: requestedSlug, ...rest } = data;
  if (requestedSlug) {
    const clash = await db().select({ id: posts.id }).from(posts).where(and(eq(posts.slug, requestedSlug), ne(posts.id, id))).limit(1);
    if (clash.length > 0) return { ok: false, error: `Another post already uses /p/${requestedSlug}.` };
  }

  const rendered = renderPost(data.body);
  const [row] = await db()
    .update(posts)
    .set({ ...rest, ...(requestedSlug ? { slug: requestedSlug } : {}), bodyHtml: rendered.html, readingMinutes: rendered.readingMinutes })
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

  const at = when ? new Date(when) : (post.publishedAt ?? new Date());
  if (Number.isNaN(at.getTime())) return { ok: false, error: "That date doesn't look right." };
  const slug = isDraftSlug(post.slug) ? await uniqueSlug(slugify(post.title), id) : post.slug;

  await db()
    .update(posts)
    .set({ slug, publishedAt: at, status: at.getTime() > Date.now() ? "scheduled" : "published" })
    .where(eq(posts.id, id));
  revalidatePublic(slug);
  return { ok: true, slug, savedAt: new Date().toISOString() };
}

export async function unpublishPost(id: number): Promise<void> {
  await requireOwner();
  const [row] = await db().update(posts).set({ status: "draft" }).where(eq(posts.id, id)).returning({ slug: posts.slug });
  if (row) revalidatePublic(row.slug);
}

export async function deletePost(id: number): Promise<void> {
  await requireOwner();
  const [row] = await db().delete(posts).where(eq(posts.id, id)).returning({ slug: posts.slug });
  if (row) revalidatePublic(row.slug);
  redirect("/admin");
}

async function uniqueSlug(base: string, id: number): Promise<string> {
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const taken = await db().select({ id: posts.id }).from(posts).where(and(eq(posts.slug, candidate), ne(posts.id, id))).limit(1);
    if (taken.length === 0) return candidate;
  }
  return `${base}-${Date.now()}`;
}

/** Clears cached pages that might show this post. */
function revalidatePublic(slug: string) {
  for (const path of ["/", "/writing", "/experiments", "/stats", `/p/${slug}`]) revalidatePath(path);
  revalidatePath("/experiments/[slug]", "page");
}
