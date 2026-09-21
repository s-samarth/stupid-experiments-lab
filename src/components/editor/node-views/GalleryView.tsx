"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { useState } from "react";
import { pickImages, uploadImage } from "../upload";

type Img = { src: string; alt: string };

export function GalleryView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const images = node.attrs.images as Img[];
  const [busy, setBusy] = useState(false);

  async function addImages() {
    const files = await pickImages(true);
    if (files.length === 0) return;
    setBusy(true);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      updateAttributes({ images: [...images, ...urls.map((src) => ({ src, alt: "" }))] });
    } finally {
      setBusy(false);
    }
  }

  const remove = (i: number) => updateAttributes({ images: images.filter((_, j) => j !== i) });

  return (
    <NodeViewWrapper as="figure" className={`gallery-figure ${selected ? "outline-2 outline-offset-4 outline-pen" : ""}`}>
      <div className="gallery" data-drag-handle>
        {images.map((img, i) => (
          <div key={img.src} className="group relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- user content from Blob */}
            <img src={img.src} alt={img.alt} />
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove image"
              className="absolute top-1 right-1 hidden rounded bg-ink/80 px-1.5 font-sans text-[12px] text-paper group-hover:block"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div contentEditable={false} className="mt-2 flex items-center gap-2 font-sans">
        <input
          value={node.attrs.caption as string}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Add a caption…"
          aria-label="Gallery caption"
          className="flex-1 bg-transparent text-center text-[14px] text-muted placeholder:text-line-strong focus:outline-none"
        />
        <button type="button" onClick={addImages} disabled={busy} className="rounded px-2 py-0.5 text-[12px] hover:bg-paper-deep">
          {busy ? "uploading…" : "+ images"}
        </button>
      </div>
    </NodeViewWrapper>
  );
}
