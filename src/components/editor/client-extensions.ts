/**
 * Browser-only editor extensions: the shared schema from lib/editor/extensions.ts,
 * plus interactive React node views, the placeholder, and image paste/drop.
 */
import { Extension, type AnyExtension } from "@tiptap/core";
import { Placeholder } from "@tiptap/extensions";
import { Plugin } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { baseExtensions } from "@/lib/editor/extensions";
import { promptForHeading } from "@/lib/loop";
import { ButtonBlock, VerdictStamp } from "@/lib/editor/nodes/blocks";
import { DataChart } from "@/lib/editor/nodes/data-chart";
import { Embed } from "@/lib/editor/nodes/embed";
import { Figure, Gallery } from "@/lib/editor/nodes/figure";
import { Footnote } from "@/lib/editor/nodes/footnote";
import { insertImages } from "./insert-items";
import { promptForLink } from "./link";
import { DataChartView } from "./node-views/DataChartView";
import { EmbedView } from "./node-views/EmbedView";
import { FigureView } from "./node-views/FigureView";
import { GalleryView } from "./node-views/GalleryView";
import { ButtonView, FootnoteView, VerdictView } from "./node-views/SmallViews";
import type { Ask } from "./PromptDialog";
import { IMAGE_TYPES } from "./upload";

type Options = { ask: Ask; notify: (message: string) => void };

const OVERRIDDEN = new Set(["figure", "gallery", "embed", "footnote", "buttonBlock", "verdictStamp", "dataChart"]);

export function clientExtensions({ ask, notify }: Options): AnyExtension[] {
  return [
    ...baseExtensions().filter((e) => !OVERRIDDEN.has(e.name)),
    Figure.extend({ addNodeView: () => ReactNodeViewRenderer(FigureView) }),
    Gallery.extend({ addNodeView: () => ReactNodeViewRenderer(GalleryView) }),
    Embed.extend({ addNodeView: () => ReactNodeViewRenderer(EmbedView) }),
    Footnote.extend({ addNodeView: () => ReactNodeViewRenderer(FootnoteView) }),
    ButtonBlock.extend({ addNodeView: () => ReactNodeViewRenderer(ButtonView) }),
    VerdictStamp.extend({ addNodeView: () => ReactNodeViewRenderer(VerdictView) }),
    DataChart.extend({ addNodeView: () => ReactNodeViewRenderer(DataChartView) }),
    MathClickToEdit.configure({ ask }),
    Extension.create({
      name: "linkShortcut",
      addKeyboardShortcuts() {
        return { "Mod-k": () => (void promptForLink(this.editor, ask), true) };
      },
    }),
    Placeholder.configure({
      // Show hints in every empty block, not just the one with the cursor, so
      // each template section shows its prompt at a glance.
      showOnlyCurrent: false,
      placeholder: ({ editor, node, pos, hasAnchor }) => {
        if (node.type.name === "heading") return "Section heading";
        // The block just before this one: a loop heading means "show its prompt".
        const before = pos > 0 ? editor.state.doc.resolve(pos).nodeBefore : null;
        const prompt = before?.type.name === "heading" ? promptForHeading(before.textContent) : null;
        return prompt ?? (hasAnchor ? "Start writing, or type / for blocks…" : "");
      },
    }),
    ImageDropPaste.configure({ notify }),
  ];
}

/** Clicking an equation opens a dialog to edit its LaTeX. */
const MathClickToEdit = Extension.create<{ ask: Ask | null }>({
  name: "mathClickToEdit",
  addOptions: () => ({ ask: null }),
  addProseMirrorPlugins() {
    const { editor } = this;
    const { ask } = this.options;
    return [
      new Plugin({
        props: {
          handleClickOn: (_view, _pos, node, nodePos) => {
            const kind = node.type.name;
            if (!ask || (kind !== "blockMath" && kind !== "inlineMath")) return false;
            void ask({
              title: "Edit LaTeX",
              submitLabel: "Save",
              fields: [{ name: "latex", label: "LaTeX", multiline: true, defaultValue: node.attrs.latex as string }],
            }).then((r) => {
              if (!r) return;
              const chain = editor.chain().focus();
              if (kind === "blockMath") chain.updateBlockMath({ latex: r.latex, pos: nodePos }).run();
              else chain.updateInlineMath({ latex: r.latex, pos: nodePos }).run();
            });
            return true;
          },
        },
      }),
    ];
  },
});

/** Pasting or dropping image files uploads them and inserts a figure (or a gallery). */
const ImageDropPaste = Extension.create<{ notify: (message: string) => void }>({
  name: "imageDropPaste",
  addOptions: () => ({ notify: () => {} }),
  addProseMirrorPlugins() {
    const { editor } = this;
    const { notify } = this.options;
    const images = (list: FileList | null | undefined) => Array.from(list ?? []).filter((f) => IMAGE_TYPES.includes(f.type));
    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            const files = images(event.clipboardData?.files);
            if (files.length === 0) return false;
            void insertImages(editor, files, notify);
            return true;
          },
          handleDrop: (view, event) => {
            const files = images(event.dataTransfer?.files);
            if (files.length === 0) return false;
            event.preventDefault();
            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            void insertImages(editor, files, notify, pos);
            return true;
          },
        },
      }),
    ];
  },
});
