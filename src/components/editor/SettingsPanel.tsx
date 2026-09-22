"use client";

import { slugify } from "@/lib/slug";

export type PostSettings = {
  slug: string;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  socialImage: string | null;
};

type Props = {
  settings: PostSettings;
  onChange: (patch: Partial<PostSettings>) => void;
  title: string;
};

const label = "mt-4 mb-1 block text-[12px] text-muted";
const field = "w-full rounded-note border border-line bg-card px-2.5 py-1.5 text-[13px] focus:border-ink focus:outline-none";

/** Post metadata: tags, its URL, and how it looks when shared. */
export function SettingsPanel({ settings: s, onChange, title }: Props) {
  return (
    <aside aria-label="Post settings" className="text-[13px]">
      <h2 className="text-[14px] font-medium">Post settings</h2>

      <label className={label} htmlFor="set-tags">Tags (comma separated)</label>
      <input
        id="set-tags"
        className={field}
        defaultValue={s.tags.join(", ")}
        onBlur={(e) => onChange({ tags: e.target.value.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8) })}
        placeholder="money, behavior"
      />

      <label className={label} htmlFor="set-slug">URL</label>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[12px] text-muted">/p/</span>
        <input
          id="set-slug"
          className={`${field} font-mono`}
          value={s.slug.startsWith("draft-") ? "" : s.slug}
          placeholder={slugify(title || "set on publish")}
          onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
        />
      </div>

      <h3 className="mt-6 text-[13px] font-medium">Search and social</h3>
      <label className={label} htmlFor="set-seo-title">Title for search and shares</label>
      <input id="set-seo-title" className={field} value={s.seoTitle ?? ""} placeholder={title} onChange={(e) => onChange({ seoTitle: e.target.value || null })} />
      <label className={label} htmlFor="set-seo-desc">Description</label>
      <textarea id="set-seo-desc" rows={3} className={field} value={s.seoDescription ?? ""} placeholder="Defaults to the subtitle" onChange={(e) => onChange({ seoDescription: e.target.value || null })} />
      <label className={label} htmlFor="set-social">Social image URL</label>
      <input id="set-social" className={field} value={s.socialImage ?? ""} placeholder="Auto-generated card if empty" onChange={(e) => onChange({ socialImage: e.target.value || null })} />
    </aside>
  );
}
