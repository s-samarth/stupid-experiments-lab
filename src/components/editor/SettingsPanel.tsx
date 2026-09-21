"use client";

import { LOOP_STAGES, experimentCode } from "@/lib/loop";
import { slugify } from "@/lib/slug";

export type PostSettings = {
  slug: string;
  kind: "log" | "finding" | "essay";
  experimentId: number | null;
  stage: number | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  socialImage: string | null;
};

type Props = {
  settings: PostSettings;
  onChange: (patch: Partial<PostSettings>) => void;
  experiments: { id: number; number: number; title: string }[];
  title: string;
};

const label = "mt-4 mb-1 block text-[12px] text-muted";
const field = "w-full rounded-note border border-line bg-card px-2.5 py-1.5 text-[13px] focus:border-ink focus:outline-none";

/** Post metadata: where it sits in the lab, its URL, and how it looks when shared. */
export function SettingsPanel({ settings: s, onChange, experiments, title }: Props) {
  const num = (v: string) => (v ? Number(v) : null);
  return (
    <aside aria-label="Post settings" className="text-[13px]">
      <h2 className="text-[14px] font-medium">Post settings</h2>

      <label className={label} htmlFor="set-kind">Kind</label>
      <select id="set-kind" className={field} value={s.kind} onChange={(e) => onChange({ kind: e.target.value as PostSettings["kind"] })}>
        <option value="log">Log entry (process)</option>
        <option value="finding">Finding (result)</option>
        <option value="essay">Essay (standalone)</option>
      </select>

      <label className={label} htmlFor="set-exp">Belongs to experiment</label>
      <select id="set-exp" className={field} value={s.experimentId ?? ""} onChange={(e) => onChange({ experimentId: num(e.target.value) })}>
        <option value="">None</option>
        {experiments.map((x) => (
          <option key={x.id} value={x.id}>{experimentCode(x.number)} · {x.title}</option>
        ))}
      </select>

      <label className={label} htmlFor="set-stage">Loop stage this entry covers</label>
      <select id="set-stage" className={field} value={s.stage ?? ""} onChange={(e) => onChange({ stage: num(e.target.value) })}>
        <option value="">Not set</option>
        {LOOP_STAGES.map((st) => (
          <option key={st.n} value={st.n}>{st.n} · {st.label}</option>
        ))}
      </select>

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
