/** "Week 2: I don't believe my rule!" -> "week-2-i-dont-believe-my-rule" */
export function slugify(input: string, maxLength = 70): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
  return slug || "untitled";
}

export function isDraftSlug(slug: string): boolean {
  return slug.startsWith("draft-");
}

export function draftSlug(): string {
  return `draft-${Math.random().toString(36).slice(2, 10)}`;
}
