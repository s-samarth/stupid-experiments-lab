"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import type { FigureSize } from "@/lib/editor/nodes/figure";
import { usePrompt } from "../PromptDialog";

const SIZES: FigureSize[] = ["normal", "wide", "full"];
const tool = "rounded px-2 py-0.5 text-[12px] hover:bg-paper-deep";

/**
 * In-editor image: the caption is typed directly under the picture, like Substack,
 * with size, alt text and link controls in a small bar that appears when selected.
 */
export function FigureView({ node, updateAttributes, selected, deleteNode }: ReactNodeViewProps) {
  const ask = usePrompt();
  const { src, alt, caption, size, href } = node.attrs as { src: string; alt: string; caption: string; size: FigureSize; href: string };

  async function editDetails() {
    const r = await ask({
      title: "Image details",
      submitLabel: "Save",
      fields: [
        { name: "alt", label: "Alt text (describe it for screen readers)", defaultValue: alt },
        { name: "href", label: "Link (optional)", defaultValue: href, placeholder: "https://" },
      ],
    });
    if (r) updateAttributes(r);
  }

  return (
    <NodeViewWrapper as="figure" data-size={size} className={`relative ${selected ? "outline-2 outline-offset-4 outline-pen" : ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- user content from Blob, sized by CSS */}
      <img src={src} alt={alt} data-drag-handle draggable />
      <input
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="Add a caption…"
        aria-label="Image caption"
        className="mt-2 w-full bg-transparent text-center font-sans text-[14px] text-muted placeholder:text-line-strong focus:outline-none"
      />
      {selected && (
        <div contentEditable={false} className="absolute top-2 right-2 flex gap-0.5 rounded-note border border-line bg-card p-1 font-sans shadow-sm">
          {SIZES.map((s) => (
            <button key={s} type="button" onClick={() => updateAttributes({ size: s })} className={`${tool} ${s === size ? "bg-amber-soft" : ""}`}>
              {s}
            </button>
          ))}
          <button type="button" onClick={editDetails} className={tool}>
            {alt ? "alt ✓" : "alt"}
          </button>
          <button type="button" onClick={deleteNode} className={`${tool} text-red`}>
            remove
          </button>
        </div>
      )}
    </NodeViewWrapper>
  );
}
