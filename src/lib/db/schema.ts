/**
 * Database schema. Drizzle turns these table definitions into both SQL
 * migrations and TypeScript types (see the `$inferSelect` exports below).
 *
 * Every table has row-level security ON with no policies. That locks out
 * Supabase's public REST API entirely; the site itself connects as the table
 * owner, which RLS doesn't restrict.
 */
import { sql } from "drizzle-orm";
import { date, index, integer, jsonb, pgEnum, pgTable, serial, smallint, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { VERDICTS } from "@/lib/loop";

export const verdict = pgEnum("verdict", VERDICTS);
export const postStatus = pgEnum("post_status", ["draft", "scheduled", "published"]);
/** "promoted" means the question became a post. */
export const questionStatus = pgEnum("question_status", ["pending", "approved", "rejected", "promoted"]);
export const questionSource = pgEnum("question_source", ["owner", "reader"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/** A blog post. Each one walks the nine-step loop from question to next question. */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull().default(""),
    subtitle: text("subtitle"),
    coverImage: text("cover_image"),
    /** Editor document (Tiptap JSON). */
    body: jsonb("body").notNull().default({ type: "doc", content: [] }),
    /** HTML rendered from `body` at save time, so readers never wait on it. */
    bodyHtml: text("body_html").notNull().default(""),
    readingMinutes: smallint("reading_minutes").notNull().default(1),
    /** Copied from the first verdict stamp in the body at save time. */
    verdict: verdict("verdict"),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    socialImage: text("social_image"),
    status: postStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index("posts_status_published_idx").on(t.status, t.publishedAt)],
).enableRLS();

/** Question box: captured by the owner or sent in by readers. */
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  askerName: text("asker_name"),
  source: questionSource("source").notNull().default("owner"),
  status: questionStatus("status").notNull().default("pending"),
  /** The post this question turned into, once it's "promoted". */
  postId: integer("post_id").references(() => posts.id, { onDelete: "set null" }),
  ipHash: text("ip_hash"),
  ...timestamps,
}).enableRLS();
/**
 * One row per reader per post per day. `visitorHash` is a salted daily hash of
 * IP + user agent, so nobody can be tracked across days and no raw IP is stored.
 */
export const postReads = pgTable(
  "post_reads",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    visitorHash: text("visitor_hash").notNull(),
    day: date("day").notNull(),
    referrerHost: text("referrer_host"),
    country: text("country"),
    device: text("device"),
    maxDepth: smallint("max_depth").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("post_reads_unique_visit").on(t.postId, t.visitorHash, t.day),
    index("post_reads_day_idx").on(t.day),
  ],
).enableRLS();

/** A reader clicked one of the share buttons. */
export const shareEvents = pgTable(
  "share_events",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("share_events_post_idx").on(t.postId)],
).enableRLS();

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Question = typeof questions.$inferSelect;
