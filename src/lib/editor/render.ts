/**
 * Turns an editor document (Tiptap JSON) into the final HTML readers see.
 * Runs once when a post is saved, not on every page view.
 */
import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import katex from "katex";
import { VERDICTS, type Verdict } from "@/lib/loop";
import { slugify } from "@/lib/slug";
import { baseExtensions } from "./extensions";
import { highlightCodeBlocks } from "./highlight";

export type RenderedPost = { html: string; readingMinutes: number; footnoteCount: number; verdict: Verdict | null };

const WORDS_PER_MINUTE = 230;

export function renderPost(doc: JSONContent): RenderedPost {
  const notes: string[] = [];
  const numbered = numberFootnotes(pruneEmptySections(doc), notes);
  let html = generateHTML(numbered, baseExtensions());
  html = anchorSections(highlightCodeBlocks(renderMath(html)));
  if (notes.length > 0) html += footnotesSection(notes);
  return {
    html,
    readingMinutes: Math.max(1, Math.round(countWords(doc) / WORDS_PER_MINUTE)),
    footnoteCount: notes.length,
    verdict: findVerdict(doc),
  };
}

/** Section headings (h2) in rendered HTML, for the reader's contents rail. */
export function listSections(html: string): { id: string; title: string }[] {
  return [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    title: unescapeHtml(m[2].replace(/<[^>]+>/g, "")),
  }));
}

/**
 * Drops empty paragraphs, then any section heading left with nothing under it,
 * so a template step the author skipped doesn't show up as a bare heading.
 */
function pruneEmptySections(doc: JSONContent): JSONContent {
  const blocks = (doc.content ?? []).filter((n) => !(n.type === "paragraph" && !n.content?.length));
  const kept = blocks.filter((n, i) => {
    if (n.type !== "heading" || n.attrs?.level !== 2) return true;
    const next = blocks[i + 1];
    return next !== undefined && !(next.type === "heading" && next.attrs?.level === 2);
  });
  return { ...doc, content: kept };
}

/** Gives every h2 an id (from its text) so sections can be linked to. */
function anchorSections(html: string): string {
  const used = new Set<string>();
  return html.replace(/<h2>(.*?)<\/h2>/g, (_m, inner: string) => {
    const base = slugify(unescapeHtml(inner.replace(/<[^>]+>/g, "")), 50);
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return `<h2 id="${id}">${inner}</h2>`;
  });
}

/** The first verdict stamp in the post, which becomes the post's list stamp. */
function findVerdict(node: JSONContent): Verdict | null {
  if (node.type === "verdictStamp") {
    const v = node.attrs?.verdict;
    return (VERDICTS as readonly string[]).includes(v) ? (v as Verdict) : null;
  }
  for (const child of node.content ?? []) {
    const found = findVerdict(child);
    if (found) return found;
  }
  return null;
}

/** Walks the document in reading order and gives each footnote its number. */
function numberFootnotes(node: JSONContent, notes: string[]): JSONContent {
  if (node.type === "footnote") {
    notes.push(String(node.attrs?.text ?? ""));
    return { ...node, attrs: { ...node.attrs, n: notes.length } };
  }
  if (!node.content) return node;
  return { ...node, content: node.content.map((child) => numberFootnotes(child, notes)) };
}

function footnotesSection(notes: string[]): string {
  const items = notes
    .map((text, i) => {
      const n = i + 1;
      return `<li id="fn-${n}">${escapeHtml(text)} <a href="#fnref-${n}" class="fn-back" aria-label="Back to text">↩</a></li>`;
    })
    .join("");
  return `<section class="footnotes" aria-labelledby="footnotes-label"><h2 id="footnotes-label" class="sr-only">Footnotes</h2><ol>${items}</ol></section>`;
}

/** Replaces the math placeholders Tiptap emits with KaTeX's static HTML. */
function renderMath(html: string): string {
  return html
    .replace(/<div([^>]*?)data-type="block-math"([^>]*?)><\/div>/g, (_m, a: string, b: string) => {
      const latex = readLatex(a + b);
      return `<div class="math-block">${katex.renderToString(latex, { displayMode: true, throwOnError: false })}</div>`;
    })
    .replace(/<span([^>]*?)data-type="inline-math"([^>]*?)><\/span>/g, (_m, a: string, b: string) => {
      const latex = readLatex(a + b);
      return katex.renderToString(latex, { displayMode: false, throwOnError: false });
    });
}

function readLatex(attrs: string): string {
  const match = attrs.match(/data-latex="([^"]*)"/);
  return match ? unescapeHtml(match[1]) : "";
}

function countWords(node: JSONContent): number {
  const own = node.text ? node.text.split(/\s+/).filter(Boolean).length : 0;
  return own + (node.content ?? []).reduce((sum, child) => sum + countWords(child), 0);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
