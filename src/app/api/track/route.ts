/**
 * Receives anonymous read, scroll-depth and share events from readers' browsers.
 * Always answers 204 so a failure never shows up on the page.
 */
import { z } from "zod";
import { isOwner } from "@/auth";
import { recordDepth, recordRead, recordShare } from "@/lib/analytics/record";
import { clientIp, country, deviceType, isBot, referrerHost, todayUtc, visitorHash } from "@/lib/analytics/visitor";
import { site } from "@/lib/site";

const Event = z.discriminatedUnion("type", [
  z.object({ type: z.literal("read"), postId: z.number().int().positive(), referrer: z.string().max(500), ref: z.string().max(40).nullable() }),
  z.object({ type: z.literal("depth"), postId: z.number().int().positive(), depth: z.union([z.literal(25), z.literal(50), z.literal(75), z.literal(100)]) }),
  z.object({ type: z.literal("share"), postId: z.number().int().positive(), channel: z.enum(["copy", "native", "x", "linkedin", "whatsapp"]) }),
]);

const noContent = () => new Response(null, { status: 204 });

export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (isBot(ua)) return noContent();
  // My own visits (while signed in) don't count.
  if (await isOwner()) return noContent();

  const parsed = Event.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return noContent();
  const event = parsed.data;

  const day = todayUtc();
  const hash = visitorHash(clientIp(request.headers), ua, day);

  try {
    if (event.type === "read") {
      await recordRead({
        postId: event.postId,
        visitorHash: hash,
        day,
        referrerHost: referrerHost(event.referrer, event.ref, new URL(site.url).hostname),
        country: country(request.headers),
        device: deviceType(ua),
      });
    } else if (event.type === "depth") {
      await recordDepth(event.postId, hash, day, event.depth);
    } else {
      await recordShare(event.postId, event.channel);
    }
  } catch (err) {
    // Unknown post id (foreign key) or a database hiccup: log it, never break the page.
    console.error("track failed", err);
  }
  return noContent();
}
