/**
 * Browser-side image upload: ask our server for a signed URL, then send the
 * file straight to Supabase Storage (it never passes through our server).
 */
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export async function uploadImage(file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error("Only JPEG, PNG, WebP, GIF or AVIF images.");

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
  });
  const data = (await res.json()) as { uploadUrl?: string; publicUrl?: string; error?: string };
  if (!res.ok || !data.uploadUrl || !data.publicUrl) throw new Error(data.error ?? "Upload failed.");

  const put = await fetch(data.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
  if (!put.ok) throw new Error(`Storage rejected the file (${put.status}).`);
  return data.publicUrl;
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
