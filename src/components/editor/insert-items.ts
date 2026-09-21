/**
 * Every block you can insert, defined once and shared by the toolbar menus
 * and the "/" slash menu.
 */
import type { Editor } from "@tiptap/core";
import { detectEmbed } from "@/lib/editor/nodes/embed";
import { VERDICTS } from "@/lib/loop";
import type { Ask } from "./PromptDialog";
import { pickImages, uploadImage } from "./upload";

export type InsertContext = { ask: Ask; notify: (message: string) => void };

export type InsertItem = {
  key: string;
  label: string;
  hint: string;
  group: "basic" | "media" | "lab";
  run: (editor: Editor, ctx: InsertContext) => unknown;
};

const chain = (editor: Editor) => editor.chain().focus();

export async function insertImages(editor: Editor, files: File[], notify: (m: string) => void, at?: number) {
  if (files.length === 0) return;
  notify(files.length > 1 ? `Uploading ${files.length} images…` : "Uploading image…");
  try {
    const urls = await Promise.all(files.map(uploadImage));
    const content =
      urls.length === 1
        ? { type: "figure", attrs: { src: urls[0], alt: "" } }
        : { type: "gallery", attrs: { images: urls.map((src) => ({ src, alt: "" })) } };
    if (at !== undefined) editor.chain().focus().insertContentAt(at, content).run();
    else chain(editor).insertContent(content).run();
    notify("Image added");
  } catch (err) {
    notify(`Upload failed: ${(err as Error).message}`);
  }
}

export const INSERT_ITEMS: InsertItem[] = [
  { key: "h2", label: "Heading", hint: "Section title", group: "basic", run: (e) => chain(e).setNode("heading", { level: 2 }).run() },
  { key: "h3", label: "Subheading", hint: "Smaller title", group: "basic", run: (e) => chain(e).setNode("heading", { level: 3 }).run() },
  { key: "bullets", label: "Bulleted list", hint: "- item", group: "basic", run: (e) => chain(e).toggleBulletList().run() },
  { key: "numbers", label: "Numbered list", hint: "1. item", group: "basic", run: (e) => chain(e).toggleOrderedList().run() },
  { key: "quote", label: "Quote", hint: "Block quote", group: "basic", run: (e) => chain(e).toggleBlockquote().run() },
  {
    key: "pull",
    label: "Pull quote",
    hint: "Big italic line",
    group: "basic",
    run: (e) => {
      if (!e.isActive("blockquote")) chain(e).toggleBlockquote().run();
      chain(e).updateAttributes("blockquote", { variant: "pull" }).run();
    },
  },
  { key: "callout", label: "Callout", hint: "Tinted aside", group: "basic", run: (e) => chain(e).setNode("callout").run() },
  { key: "divider", label: "Divider", hint: "* * *", group: "basic", run: (e) => chain(e).setHorizontalRule().run() },
  { key: "code", label: "Code block", hint: "```", group: "basic", run: (e) => chain(e).toggleCodeBlock().run() },
  { key: "table", label: "Table", hint: "3 × 3", group: "basic", run: (e) => chain(e).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  {
    key: "footnote",
    label: "Footnote",
    hint: "Numbered note",
    group: "basic",
    run: async (e, { ask }) => {
      const r = await ask({ title: "Footnote", fields: [{ name: "text", label: "Note", multiline: true, required: true }] });
      if (r?.text) chain(e).insertFootnote(r.text).run();
    },
  },
  {
    key: "math",
    label: "LaTeX",
    hint: "Equation block",
    group: "basic",
    run: async (e, { ask }) => {
      const r = await ask({ title: "LaTeX equation", fields: [{ name: "latex", label: "LaTeX", placeholder: "E = mc^2", multiline: true, required: true }] });
      if (r?.latex) chain(e).insertBlockMath({ latex: r.latex }).run();
    },
  },
  {
    key: "button",
    label: "Button",
    hint: "Call to action",
    group: "basic",
    run: async (e, { ask }) => {
      const r = await ask({ title: "Button", fields: [{ name: "label", label: "Label", required: true }, { name: "href", label: "Link", placeholder: "https://", required: true }] });
      if (r) chain(e).insertContent({ type: "buttonBlock", attrs: r }).run();
    },
  },
  { key: "image", label: "Image", hint: "Upload", group: "media", run: async (e, { notify }) => insertImages(e, await pickImages(false), notify) },
  { key: "gallery", label: "Image gallery", hint: "Several images", group: "media", run: async (e, { notify }) => insertImages(e, await pickImages(true), notify) },
  {
    key: "embed",
    label: "Embed",
    hint: "YouTube, X, Spotify…",
    group: "media",
    run: async (e, { ask, notify }) => {
      const r = await ask({ title: "Embed a link", fields: [{ name: "url", label: "URL", placeholder: "https://youtu.be/…", required: true }] });
      if (!r?.url) return;
      if (!detectEmbed(r.url)) return notify("That doesn't look like a link.");
      chain(e).insertContent({ type: "embed", attrs: { url: r.url } }).run();
    },
  },
  { key: "hypothesis", label: "Hypothesis card", hint: "Boxed theory", group: "lab", run: (e) => chain(e).setNode("hypothesis").run() },
  {
    key: "verdict",
    label: "Verdict stamp",
    hint: "confirmed, busted…",
    group: "lab",
    run: async (e, { ask }) => {
      const r = await ask({ title: "Verdict", fields: [{ name: "verdict", label: "Stamp", options: [...VERDICTS] }] });
      if (r) chain(e).insertContent({ type: "verdictStamp", attrs: r }).run();
    },
  },
  { key: "margin", label: "Margin note", hint: "Handwritten aside", group: "lab", run: (e) => chain(e).setNode("marginNote").run() },
];

export function filterItems(query: string): InsertItem[] {
  const q = query.toLowerCase();
  return INSERT_ITEMS.filter((i) => i.label.toLowerCase().includes(q) || i.key.includes(q) || i.hint.toLowerCase().includes(q));
}
