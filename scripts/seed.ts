/**
 * Fills a development database with sample data.
 * Usage: npm run db:seed -- --reset   (wipes all tables first)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { closeDb, db, postReads, posts, questions } from "../src/lib/db";
import { renderPost } from "../src/lib/editor/render";
import { POSTS, QUESTIONS } from "./seed-data";

const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const isoDay = (d: Date) => d.toISOString().slice(0, 10);
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

async function main() {
  if (!process.argv.includes("--reset")) {
    console.error("Refusing to run without --reset (this wipes every table). Never run against production.");
    process.exit(1);
  }
  await db().execute(sql`TRUNCATE post_reads, share_events, questions, posts RESTART IDENTITY CASCADE`);

  for (const s of POSTS) {
    const rendered = renderPost(s.body);
    const [row] = await db()
      .insert(posts)
      .values({
        slug: s.slug, title: s.title, subtitle: s.subtitle, verdict: rendered.verdict,
        body: s.body, bodyHtml: rendered.html, readingMinutes: rendered.readingMinutes,
        tags: s.tags, status: "published", publishedAt: daysAgo(s.daysAgo),
      })
      .returning({ id: posts.id });
    await seedReads(row.id, s.reads, s.daysAgo);
  }

  await db().insert(questions).values(QUESTIONS);
  console.log(`Seeded ${POSTS.length} posts, ${QUESTIONS.length} questions.`);
}

/** Fake reads spread over the days since publishing, capped for speed. */
async function seedReads(postId: number, total: number, sinceDays: number) {
  const referrers = ["linkedin.com", "linkedin.com", "whatsapp", null, null, "x.com", "google.com", "news.ycombinator.com"];
  const countries = ["IN", "IN", "IN", "IN", "US", "US", "GB", "SG", "DE", "AE"];
  const devices = ["mobile", "mobile", "desktop"];
  const rows = Array.from({ length: Math.min(total, 4000) }, (_, i) => {
    const age = Math.floor(Math.random() ** 2 * Math.max(1, sinceDays));
    return {
      postId,
      visitorHash: createHash("sha256").update(`${postId}-${i}`).digest("hex").slice(0, 32),
      day: isoDay(daysAgo(age)),
      referrerHost: pick(referrers),
      country: pick(countries),
      device: pick(devices),
      maxDepth: pick([25, 50, 50, 75, 75, 100, 100, 100]),
      createdAt: daysAgo(age),
    };
  });
  for (let i = 0; i < rows.length; i += 200) {
    await db().insert(postReads).values(rows.slice(i, i + 200));
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closeDb);
