/**
 * The document schema shared by the browser editor and the server renderer.
 * Anything added here is automatically understood in both places.
 */
import { Extension, type AnyExtension } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mathematics from "@tiptap/extension-mathematics";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { ButtonBlock, Callout, Hypothesis, MarginNote, VerdictStamp } from "./nodes/blocks";
import { Embed } from "./nodes/embed";
import { Figure, Gallery } from "./nodes/figure";
import { Footnote } from "./nodes/footnote";

export const lowlight = createLowlight(common);

/** Adds `variant="pull"` to blockquotes, turning them into pull quotes. */
const PullQuote = Extension.create({
  name: "pullQuote",
  addGlobalAttributes() {
    return [
      {
        types: ["blockquote"],
        attributes: {
          variant: {
            default: null,
            parseHTML: (el) => el.getAttribute("data-variant"),
            renderHTML: (attrs) => (attrs.variant ? { "data-variant": attrs.variant } : {}),
          },
        },
      },
    ];
  },
});

export function baseExtensions(): AnyExtension[] {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4] },
      codeBlock: false,
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    PullQuote,
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: "plaintext" }),
    Subscript,
    Superscript,
    TableKit.configure({ table: { resizable: false } }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
    Figure,
    Gallery,
    Embed,
    Footnote,
    Callout,
    Hypothesis,
    MarginNote,
    VerdictStamp,
    ButtonBlock,
  ];
}
