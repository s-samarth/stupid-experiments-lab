/**
 * Daily keep-alive. Supabase's free plan pauses a project after 7 days with no
 * database activity; Vercel Cron calls this once a day (see vercel.json) so a
 * quiet week never takes the site down.
 */
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel sends "Authorization: Bearer <CRON_SECRET>" on cron calls.
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const [row] = await db().execute<{ posts: number }>(sql`SELECT count(*)::int AS posts FROM posts`);
  return Response.json({ ok: true, posts: row?.posts ?? 0, at: new Date().toISOString() });
}
