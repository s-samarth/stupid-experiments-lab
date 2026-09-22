"use client";

import { useState } from "react";
import { slugify } from "@/lib/slug";
import { pickImages, uploadImage } from "./upload";

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
  notify: (message: string) => void;
};

const label = "mt-4 mb-1 block text-[12px] text-muted";
const field = "w-full rounded-note border border-line bg-card px-2.5 py-1.5 text-[13px] focus:border-ink focus:outline-none";

/** Post metadata: tags, its URL, and how it looks when shared. */
export function SettingsPanel({ settings: s, onChange, title, notify }: Props) {
  const [uploading, setUploading] = useState(false);

  async function chooseSocialImage() {
    const [file] = await pickImages(false);
    if (!file) return;
    setUploading(true);
    try {
      onChange({ socialImage: await uploadImage(file) });
    } catch (err) {
      notify(`Upload failed: ${(err as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

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
      <p className={label}>Share image (shown on WhatsApp, LinkedIn, X)</p>
      {s.socialImage ? (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element -- user upload, preview only */}
          <img src={s.socialImage} alt="" className="aspect-[1200/630] w-full rounded-note border border-line object-cover" />
          <div className="mt-1.5 flex gap-3 text-[12px]">
            <button type="button" onClick={chooseSocialImage} className="text-pen hover:underline">Replace</button>
            <button type="button" onClick={() => onChange({ socialImage: null })} className="text-muted hover:text-red">Remove</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={chooseSocialImage} disabled={uploading} className={`${field} text-left text-muted hover:border-ink`}>
          {uploading ? "Uploading…" : "Upload an image (a card is generated if you don't)"}
        </button>
      )}
    </aside>
  );
}
