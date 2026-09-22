"use server";

/**
 * Server Action: this function runs on the server, but the question form calls
 * it directly, as if it were local. Next.js wires up the request for us.
 */
import { createHash } from "node:crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { z } from "zod";
import { clientIp } from "@/lib/analytics/visitor";
import { db, questions } from "@/lib/db";

export type AskState = { ok: boolean; message: string } | null;

const Ask = z.object({
  text: z.string().trim().min(10, "A bit longer, please. At least 10 characters.").max(280, "Keep it under 280 characters."),
  name: z.string().trim().max(40, "Names up to 40 characters.").optional(),
  // Honeypot: hidden from people, but bots fill in every field.
  website: z.string().max(0).optional(),
});

const MAX_PER_HOUR = 3;

export async function askQuestion(_prev: AskState, form: FormData): Promise<AskState> {
  const parsed = Ask.safeParse({
    text: form.get("text") ?? "",
    name: form.get("name") || undefined,
    website: form.get("website") || undefined,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    // Pretend the bot succeeded so it doesn't learn anything.
    if (issue.path[0] === "website") return { ok: true, message: "Got it. It's in the queue." };
    return { ok: false, message: issue.message };
  }

  const ipHash = hashIp(clientIp(await headers()));
  const [{ recent }] = await db()
    .select({ recent: sql<number>`count(*)::int` })
    .from(questions)
    .where(and(eq(questions.ipHash, ipHash), gt(questions.createdAt, sql`now() - interval '1 hour'`)));
  if (recent >= MAX_PER_HOUR) {
    return { ok: false, message: "That's a lot of curiosity for one hour. Try again later." };
  }

  await db().insert(questions).values({
    text: parsed.data.text,
    askerName: parsed.data.name || null,
    source: "reader",
    status: "pending",
    ipHash,
  });
  return { ok: true, message: "Got it. I read every one; the good ones go up on the board." };
}

function hashIp(ip: string): string {
  const salt = process.env.ANALYTICS_SALT ?? "dev-salt";
  return createHash("sha256").update(`${salt}|q|${ip}`).digest("hex").slice(0, 32);
}
