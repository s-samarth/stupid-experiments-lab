/** Browser-side image upload to Vercel Blob (via a token from /api/upload). */
import { upload } from "@vercel/blob/client";
import { slugify } from "@/lib/slug";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Only JPEG, PNG, WebP, GIF or AVIF images.");
  const dot = file.name.lastIndexOf(".");
  const base = slugify(dot > 0 ? file.name.slice(0, dot) : file.name, 40);
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "jpg";
  const blob = await upload(`posts/${base}.${ext}`, file, {
    access: "public",
    handleUploadUrl: "/api/upload",
    contentType: file.type,
  });
  return blob.url;
}

/** Opens the OS file picker and resolves with the chosen images (possibly none). */
export function pickImages(multiple = false): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_TYPES.join(",");
    input.multiple = multiple;
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.oncancel = () => resolve([]);
    input.click();
  });
}
