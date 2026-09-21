/**
 * Image storage on Supabase Storage, via its REST API (no SDK needed).
 * Server-only: uses the secret key, which must never reach the browser.
 */
export const IMAGE_BUCKET = "lab-images";
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** https://<ref>.supabase.co, from SUPABASE_URL or derived from the pooler username "postgres.<ref>". */
export function supabaseUrl(): string {
  if (process.env.SUPABASE_URL) return process.env.SUPABASE_URL.replace(/\/$/, "");
  const ref = process.env.DATABASE_URL?.match(/:\/\/postgres\.([a-z0-9]+):/)?.[1];
  if (!ref) throw new Error("Set SUPABASE_URL (Supabase → Project Settings → API).");
  return `https://${ref}.supabase.co`;
}

function authHeaders(): Record<string, string> {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set.");
  // New-style keys (sb_secret_…) go in `apikey`; legacy service_role JWTs also need Bearer.
  return key.startsWith("sb_") ? { apikey: key } : { apikey: key, Authorization: `Bearer ${key}` };
}

export function publicImageUrl(path: string): string {
  return `${supabaseUrl()}/storage/v1/object/public/${IMAGE_BUCKET}/${path}`;
}

/** A one-time URL the browser can PUT the file to directly (valid for 2 hours). */
export async function createSignedUpload(path: string): Promise<string> {
  const res = await fetch(`${supabaseUrl()}/storage/v1/object/upload/sign/${IMAGE_BUCKET}/${path}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Storage refused the upload (${res.status}): ${await res.text()}`);
  const { url } = (await res.json()) as { url: string };
  return `${supabaseUrl()}/storage/v1${url}`;
}

/** Creates the public images bucket if it doesn't exist yet. Safe to run repeatedly. */
export async function ensureImageBucket(): Promise<"created" | "exists"> {
  const res = await fetch(`${supabaseUrl()}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...authHeaders(), "content-type": "application/json" },
    body: JSON.stringify({
      id: IMAGE_BUCKET,
      name: IMAGE_BUCKET,
      public: true,
      file_size_limit: MAX_IMAGE_BYTES,
      allowed_mime_types: IMAGE_TYPES,
    }),
  });
  if (res.ok) return "created";
  const body = await res.text();
  if (/already exists|Duplicate/i.test(body)) return "exists";
  throw new Error(`Couldn't create bucket (${res.status}): ${body}`);
}
