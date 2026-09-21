/**
 * Hands the editor a one-time signed URL so the browser uploads the image
 * straight to Supabase Storage. Only the signed-in owner gets one.
 */
import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isOwner } from "@/auth";
import { slugify } from "@/lib/slug";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, createSignedUpload, publicImageUrl } from "@/lib/storage";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

const UploadRequest = z.object({
  filename: z.string().max(200),
  contentType: z.enum(IMAGE_TYPES as [string, ...string[]]),
  size: z.number().int().positive().max(MAX_IMAGE_BYTES, "Images must be under 15 MB."),
});

export async function POST(request: Request) {
  if (!(await isOwner())) return NextResponse.json({ error: "Not allowed" }, { status: 401 });
  const parsed = UploadRequest.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const { filename, contentType } = parsed.data;
  const base = slugify(filename.replace(/\.[^.]+$/, ""), 40);
  const month = new Date().toISOString().slice(0, 7);
  // Random suffix: two uploads of "screenshot.png" never overwrite each other.
  const path = `${month}/${base}-${randomBytes(4).toString("hex")}.${EXT[contentType]}`;

  try {
    const uploadUrl = await createSignedUpload(path);
    return NextResponse.json({ uploadUrl, publicUrl: publicImageUrl(path) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Storage isn't configured yet." }, { status: 500 });
  }
}
