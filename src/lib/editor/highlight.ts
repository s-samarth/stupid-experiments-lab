/**
 * Server-side syntax highlighting for code blocks. The editor highlights with
 * decorations that never reach the saved HTML, so we highlight again here.
 */
import type { Element, Root, RootContent } from "hast";
import { lowlight } from "./extensions";

const CODE_BLOCK = /<pre><code(?: class="language-([\w+#-]+)")?>([\s\S]*?)<\/code><\/pre>/g;

export function highlightCodeBlocks(html: string): string {
  return html.replace(CODE_BLOCK, (whole, lang: string | undefined, escaped: string) => {
    const code = unescape(escaped);
    let tree: Root;
    try {
      tree = lang && lowlight.registered(lang) ? lowlight.highlight(lang, code) : lowlight.highlightAuto(code);
    } catch {
      return whole;
    }
    const cls = lang ? ` class="language-${lang}"` : "";
    return `<pre><code${cls}>${toHtml(tree.children)}</code></pre>`;
  });
}

/** Minimal hast → HTML: lowlight only emits spans with classes and text. */
function toHtml(nodes: RootContent[]): string {
  return nodes
    .map((node) => {
      if (node.type === "text") return escape(node.value);
      if (node.type === "element") return elementToHtml(node);
      return "";
    })
    .join("");
}

function elementToHtml(el: Element): string {
  const classes = el.properties?.className;
  const cls = Array.isArray(classes) ? ` class="${classes.join(" ")}"` : "";
  return `<span${cls}>${toHtml(el.children as RootContent[])}</span>`;
}

function escape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function unescape(s: string): string {
  return s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}
