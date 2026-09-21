/**
 * Database schema. Drizzle turns these table definitions into both SQL
 * migrations and TypeScript types (see the `$inferSelect` exports below).
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { EXPERIMENT_STATUSES, VERDICTS } from "@/lib/loop";

export const experimentStatus = pgEnum("experiment_status", EXPERIMENT_STATUSES);
export const verdict = pgEnum("verdict", VERDICTS);
export const postKind = pgEnum("post_kind", ["log", "finding", "essay"]);
export const postStatus = pgEnum("post_status", ["draft", "scheduled", "published"]);
export const questionStatus = pgEnum("question_status", ["pending", "approved", "rejected", "promoted"]);
export const questionSource = pgEnum("question_source", ["owner", "reader"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

/** An experiment: the container that log entries and findings belong to. */
export const experiments = pgTable("experiments", {
  id: serial("id").primaryKey(),
  number: integer("number").notNull().unique(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  question: text("question").notNull(),
  hypothesis: text("hypothesis"),
  measure: text("measure"),
  killCriterion: text("kill_criterion"),
  stage: smallint("stage").notNull().default(1),
  status: experimentStatus("status").notNull().default("running"),
  verdict: verdict("verdict"),
  /** Short handwritten status line on cards, e.g. "down 3.1%. hmm." */
  scribble: text("scribble"),
  tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
  startedOn: date("started_on"),
  endedOn: date("ended_on"),
  spawnedFromId: integer("spawned_from_id").references((): AnyPgColumn => experiments.id, {
    onDelete: "set null",
  }),
  askedBy: text("asked_by"),
  isPublic: boolean("is_public").notNull().default(true),
  ...timestamps,
});

/** A piece of writing. Optionally attached to an experiment. */
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull().default(""),
    subtitle: text("subtitle"),
    kind: postKind("kind").notNull().default("essay"),
    experimentId: integer("experiment_id").references(() => experiments.id, { onDelete: "set null" }),
    stage: smallint("stage"),
    coverImage: text("cover_image"),
    /** Editor document (Tiptap JSON). */
    body: jsonb("body").notNull().default({ type: "doc", content: [] }),
    /** HTML rendered from `body` at save time, so readers never wait on it. */
    bodyHtml: text("body_html").notNull().default(""),
    readingMinutes: smallint("reading_minutes").notNull().default(1),
    tags: text("tags").array().notNull().default(sql`'{}'::text[]`),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    socialImage: text("social_image"),
    status: postStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index("posts_status_published_idx").on(t.status, t.publishedAt),
    index("posts_experiment_idx").on(t.experimentId),
  ],
);

/** Question box: captured by the owner or suggested by readers. */
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  askerName: text("asker_name"),
  source: questionSource("source").notNull().default("owner"),
  status: questionStatus("status").notNull().default("pending"),
  experimentId: integer("experiment_id").references(() => experiments.id, { onDelete: "set null" }),
  ipHash: text("ip_hash"),
  ...timestamps,
});

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
);

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
);

export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Question = typeof questions.$inferSelect;
