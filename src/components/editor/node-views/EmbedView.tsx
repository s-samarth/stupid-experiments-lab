"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { detectEmbed } from "@/lib/editor/nodes/embed";

/** Live preview of an embed. Iframes ignore clicks here so the node stays selectable. */
export function EmbedView({ node, selected }: ReactNodeViewProps) {
  const info = detectEmbed(node.attrs.url as string);
  return (
    <NodeViewWrapper className={`embed ${selected ? "outline-2 outline-offset-4 outline-pen" : ""}`} data-kind={info?.kind} data-drag-handle>
      {info?.frameSrc ? (
        <iframe src={info.frameSrc} title="Embed preview" className="pointer-events-none" height={info.kind === "spotify" ? 152 : undefined} />
      ) : (
        <span className="embed-card">
          <span className="embed-card-kind">{info?.kind ?? "link"}</span>
          <span className="embed-card-url">{node.attrs.url as string}</span>
        </span>
      )}
    </NodeViewWrapper>
  );
}
