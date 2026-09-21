/** Image with caption, alt text, size (normal / wide / full) and optional link. */
import { Node } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { safeHref } from "./blocks";

export type FigureSize = "normal" | "wide" | "full";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    figure: {
      insertFigure: (attrs: { src: string; alt?: string; caption?: string }) => ReturnType;
    };
  }
}

export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      size: { default: "normal" as FigureSize },
      href: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (el) => {
          const img = el.querySelector("img");
          if (!img) return false;
          return {
            src: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt") ?? "",
            caption: el.querySelector("figcaption")?.textContent ?? "",
            size: el.getAttribute("data-size") ?? "normal",
            href: el.querySelector("a")?.getAttribute("href") ?? "",
          };
        },
      },
      // Pasted plain <img> tags become figures too.
      { tag: "img[src]", getAttrs: (el) => ({ src: el.getAttribute("src"), alt: el.getAttribute("alt") ?? "" }) },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, caption, size, href } = node.attrs;
    const img: DOMOutputSpec = ["img", { src, alt, loading: "lazy", decoding: "async" }];
    const media: DOMOutputSpec = href
      ? ["a", { href: safeHref(href), target: "_blank", rel: "noopener noreferrer" }, img]
      : img;
    return caption
      ? ["figure", { "data-size": size }, media, ["figcaption", {}, caption]]
      : ["figure", { "data-size": size }, media];
  },

  addCommands() {
    return {
      insertFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

/** A row of images with one shared caption. */
export const Gallery = Node.create({
  name: "gallery",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      images: { default: [] as { src: string; alt: string }[] },
      caption: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure.gallery-figure",
        getAttrs: (el) => ({
          images: Array.from(el.querySelectorAll("img")).map((img) => ({
            src: img.getAttribute("src") ?? "",
            alt: img.getAttribute("alt") ?? "",
          })),
          caption: el.querySelector("figcaption")?.textContent ?? "",
        }),
      },
    ];
  },

  renderHTML({ node }) {
    const images = (node.attrs.images as { src: string; alt: string }[]).map(
      (i): DOMOutputSpec => ["img", { src: i.src, alt: i.alt, loading: "lazy", decoding: "async" }],
    );
    const grid: DOMOutputSpec = ["div", { class: "gallery" }, ...images];
    return node.attrs.caption
      ? ["figure", { class: "gallery-figure" }, grid, ["figcaption", {}, node.attrs.caption]]
      : ["figure", { class: "gallery-figure" }, grid];
  },
});
