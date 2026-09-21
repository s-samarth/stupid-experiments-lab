/**
 * Works out anonymous, aggregate-only facts about a request. No raw IP, user
 * agent or cookie is ever stored: only a daily salted hash that can't be reversed
 * and changes every day.
 */
import { createHash } from "node:crypto";

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|embedly|quora link|vercel|lighthouse|headless|python-requests|curl|wget/i;

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT_UA.test(userAgent);
}

export function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function visitorHash(ip: string, userAgent: string, day: string): string {
  const salt = process.env.ANALYTICS_SALT ?? "dev-salt";
  return createHash("sha256").update(`${salt}|${day}|${ip}|${userAgent}`).digest("hex").slice(0, 32);
}

export function clientIp(headers: Headers): string {
  return headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "0.0.0.0";
}

/** Vercel adds this header on deployed requests; locally it's absent. */
export function country(headers: Headers): string | null {
  const c = headers.get("x-vercel-ip-country");
  return c && /^[A-Z]{2}$/.test(c) ? c : null;
}

export function deviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  if (/ipad|tablet/i.test(userAgent)) return "tablet";
  if (/mobi|android|iphone/i.test(userAgent)) return "mobile";
  return "desktop";
}

const REFERRER_ALIASES: Record<string, string> = {
  "t.co": "x.com",
  "twitter.com": "x.com",
  "lnkd.in": "linkedin.com",
  "com.linkedin.android": "linkedin.com",
  "l.instagram.com": "instagram.com",
  "l.facebook.com": "facebook.com",
  "m.facebook.com": "facebook.com",
};

const REF_PARAM = /^[a-z0-9.-]{2,40}$/;

/**
 * Normalises a referrer to a host like "linkedin.com"; null for direct or internal
 * visits. Apps like WhatsApp send no referrer, so share links carry `?ref=whatsapp`
 * and that's used as the fallback.
 */
export function referrerHost(referrer: string, refParam: string | null, ownHost: string): string | null {
  if (!referrer) return refParam && REF_PARAM.test(refParam) ? refParam : null;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host === ownHost.replace(/^www\./, "")) return null;
    const bare = host.replace(/^(m|mobile|lm|l)\./, "");
    return REFERRER_ALIASES[host] ?? REFERRER_ALIASES[bare] ?? (bare.endsWith("linkedin.com") ? "linkedin.com" : bare);
  } catch {
    return null;
  }
}
