/**
 * Turns an editor document (Tiptap JSON) into plain Markdown, for AI agents and
 * LLM crawlers (`/p/<slug>.md`, `/llms-full.txt`). Built from the JSON rather
 * than the HTML because the HTML contains KaTeX and chart markup that reads as
 * noise once the tags are stripped. Custom lab blocks become readable text.
 */
import type { JSONContent } from "@tiptap/core";
import { pruneEmptySections } from "@/lib/editor/render";

type Mark = NonNullable<JSONContent["marks"]>[number];

export function docToMarkdown(doc: JSONContent): string {
  const notes: string[] = [];
  const body = blocks(pruneEmptySections(doc).content ?? [], notes);
  const footnotes = notes.map((n, i) => `[^${i + 1}]: ${n}`).join("\n");
  return [body, footnotes].filter(Boolean).join("\n\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

/** First `max` characters of the post's text, cut at a word, for descriptions. */
export function docExcerpt(doc: JSONContent, max = 155): string {
  const text = plain(doc).replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max - 1)).replace(/[,;:.\s]+$/, "") + "…";
}

function plain(node: JSONContent): string {
  // Headings are skipped: in a template post they're just the step names.
  if (node.type === "heading") return "";
  if (node.text) return node.text;
  return (node.content ?? []).map(plain).join(node.type === "doc" ? " " : "");
}

function blocks(nodes: JSONContent[], notes: string[]): string {
  return nodes.map((n) => block(n, notes)).filter(Boolean).join("\n\n");
}

function block(n: JSONContent, notes: string[]): string {
  const a = n.attrs ?? {};
  const kids = n.content ?? [];
  switch (n.type) {
    case "heading":
      return `${"#".repeat(Math.min(6, Number(a.level) || 2))} ${inline(kids, notes)}`;
    case "paragraph":
      return inline(kids, notes);
    case "bulletList":
      return kids.map((li) => listItem(li, "- ", notes)).join("\n");
    case "orderedList":
      return kids.map((li, i) => listItem(li, `${(Number(a.start) || 1) + i}. `, notes)).join("\n");
    case "blockquote":
      return quote(blocks(kids, notes));
    case "codeBlock":
      return `\`\`\`${a.language && a.language !== "plaintext" ? a.language : ""}\n${kids.map((k) => k.text ?? "").join("")}\n\`\`\``;
    case "horizontalRule":
      return "---";
    case "blockMath":
      return `$$\n${a.latex ?? ""}\n$$`;
    case "figure":
      return [a.src && `![${a.alt ?? ""}](${a.src})`, a.caption && `*${a.caption}*`].filter(Boolean).join("\n");
    case "gallery":
      return [...(a.images ?? []).map((i: { src: string; alt: string }) => `![${i.alt}](${i.src})`), a.caption && `*${a.caption}*`].filter(Boolean).join("\n");
    case "embed":
      return a.url ? `[Embedded: ${a.url}](${a.url})` : "";
    case "callout":
      return quote(`**Note:** ${blocks(kids, notes)}`);
    case "hypothesis":
      return quote(`**Hypothesis:** ${blocks(kids, notes)}`);
    case "marginNote":
      return `*Margin note: ${inline(kids, notes)}*`;
    case "verdictStamp":
      return `**Verdict: ${String(a.verdict ?? "inconclusive").toUpperCase()}**`;
    case "buttonBlock":
      return a.href ? `[${a.label || a.href}](${a.href})` : "";
    case "dataChart":
      return [a.caption && `*Chart: ${a.caption}*`, "```csv", String(a.csv ?? "").trim(), "```"].filter(Boolean).join("\n");
    case "table":
      return table(kids, notes);
    default:
      return kids.length ? blocks(kids, notes) : (n.text ?? "");
  }
}

function listItem(li: JSONContent, bullet: string, notes: string[]): string {
  const text = blocks(li.content ?? [], notes);
  return bullet + text.replace(/\n/g, `\n${" ".repeat(bullet.length)}`);
}

const quote = (text: string) => text.split("\n").map((l) => `> ${l}`.trimEnd()).join("\n");

function table(rows: JSONContent[], notes: string[]): string {
  const cells = rows.map((r) => (r.content ?? []).map((c) => blocks(c.content ?? [], notes).replace(/\n+/g, " ").replace(/\|/g, "\\|")));
  if (!cells.length) return "";
  const line = (r: string[]) => `| ${r.join(" | ")} |`;
  return [line(cells[0]), line(cells[0].map(() => "---")), ...cells.slice(1).map(line)].join("\n");
}

function inline(nodes: JSONContent[], notes: string[]): string {
  return nodes
    .map((n) => {
      if (n.type === "hardBreak") return "  \n";
      if (n.type === "inlineMath") return `$${n.attrs?.latex ?? ""}$`;
      if (n.type === "footnote") {
        notes.push(String(n.attrs?.text ?? ""));
        return `[^${notes.length}]`;
      }
      return (n.marks ?? []).reduce(applyMark, n.text ?? "");
    })
    .join("");
}

function applyMark(text: string, mark: Mark): string {
  switch (mark.type) {
    case "bold":
      return `**${text}**`;
    case "italic":
      return `*${text}*`;
    case "strike":
      return `~~${text}~~`;
    case "code":
      return `\`${text}\``;
    case "link":
      return `[${text}](${mark.attrs?.href ?? ""})`;
    default:
      return text;
  }
}
