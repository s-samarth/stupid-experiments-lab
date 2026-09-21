/**
 * Turns an editor document (Tiptap JSON) into the final HTML readers see.
 * Runs once when a post is saved, not on every page view.
 */
import { generateHTML } from "@tiptap/html/server";
import type { JSONContent } from "@tiptap/core";
import katex from "katex";
import { baseExtensions } from "./extensions";
import { highlightCodeBlocks } from "./highlight";

export type RenderedPost = { html: string; readingMinutes: number; footnoteCount: number };

const WORDS_PER_MINUTE = 230;

export function renderPost(doc: JSONContent): RenderedPost {
  const notes: string[] = [];
  const numbered = numberFootnotes(doc, notes);
  let html = generateHTML(numbered, baseExtensions());
  html = highlightCodeBlocks(renderMath(html));
  if (notes.length > 0) html += footnotesSection(notes);
  return {
    html,
    readingMinutes: Math.max(1, Math.round(countWords(doc) / WORDS_PER_MINUTE)),
    footnoteCount: notes.length,
  };
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
