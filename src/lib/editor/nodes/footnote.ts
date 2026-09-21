/**
 * Inline footnote. The note text lives in an attribute. Numbers are assigned at
 * render time (see render.ts); in the editor a CSS counter shows them live.
 */
import { Node } from "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    footnote: { insertFootnote: (text: string) => ReturnType };
  }
}

export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      text: { default: "" },
      n: { default: null as number | null },
    };
  },

  parseHTML() {
    return [
      {
        tag: "sup.fn",
        getAttrs: (el) => ({ text: el.querySelector("a")?.getAttribute("data-note") ?? "" }),
      },
    ];
  },

  renderHTML({ node }) {
    const n = node.attrs.n as number | null;
    const link = {
      class: "fn-ref",
      href: n ? `#fn-${n}` : "#",
      "data-note": node.attrs.text,
      "aria-describedby": "footnotes-label",
    };
    return ["sup", { class: "fn", id: n ? `fnref-${n}` : undefined }, ["a", link, n ? String(n) : ""]];
  },

  addCommands() {
    return {
      insertFootnote:
        (text) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { text } }),
    };
  },
});
