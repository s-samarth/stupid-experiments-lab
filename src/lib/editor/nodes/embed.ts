/**
 * Embeds from a pasted URL, like Substack. Only known providers get an iframe
 * (with a fixed, trusted src). Everything else becomes a plain link card.
 */
import { Node } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";

export type EmbedKind = "youtube" | "vimeo" | "spotify" | "x" | "gist" | "link";
export type EmbedInfo = { kind: EmbedKind; url: string; frameSrc: string | null };

const KIND_LABEL: Record<EmbedKind, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  spotify: "Spotify",
  x: "Post on X",
  gist: "GitHub Gist",
  link: "Link",
};

/** Works out which provider a URL belongs to and the iframe URL to use, if any. */
export function detectEmbed(raw: string): EmbedInfo | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (!/^https?:$/.test(u.protocol)) return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");
  const url = u.toString();

  const yt =
    host === "youtu.be" ? u.pathname.slice(1) : host === "youtube.com" ? (u.searchParams.get("v") ?? u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1]) : null;
  if (yt && /^[\w-]{6,20}$/.test(yt)) {
    return { kind: "youtube", url, frameSrc: `https://www.youtube-nocookie.com/embed/${yt}` };
  }
  const vimeo = host === "vimeo.com" ? u.pathname.match(/^\/(\d+)/)?.[1] : null;
  if (vimeo) return { kind: "vimeo", url, frameSrc: `https://player.vimeo.com/video/${vimeo}` };

  const spotify = host === "open.spotify.com" ? u.pathname.match(/^\/(track|album|playlist|episode|show)\/(\w+)/) : null;
  if (spotify) return { kind: "spotify", url, frameSrc: `https://open.spotify.com/embed/${spotify[1]}/${spotify[2]}` };

  if ((host === "x.com" || host === "twitter.com") && /\/status\/\d+/.test(u.pathname)) {
    return { kind: "x", url, frameSrc: null };
  }
  if (host === "gist.github.com") return { kind: "gist", url, frameSrc: null };
  return { kind: "link", url, frameSrc: null };
}

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { url: { default: "" } };
  },

  parseHTML() {
    return [{ tag: "div.embed[data-url]", getAttrs: (el) => ({ url: el.getAttribute("data-url") }) }];
  },

  renderHTML({ node }) {
    const info = detectEmbed(node.attrs.url);
    if (!info) return ["div", { class: "embed", "data-url": "" }];
    const attrs = { class: "embed", "data-kind": info.kind, "data-url": info.url };
    if (info.frameSrc) {
      const height = info.kind === "spotify" ? "152" : undefined;
      const iframe: DOMOutputSpec = [
        "iframe",
        {
          src: info.frameSrc,
          loading: "lazy",
          allow: "encrypted-media; picture-in-picture; fullscreen",
          referrerpolicy: "strict-origin-when-cross-origin",
          title: `${KIND_LABEL[info.kind]} embed`,
          ...(height ? { height } : {}),
        },
      ];
      return ["div", attrs, iframe];
    }
    const display = info.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 80);
    return [
      "div",
      attrs,
      [
        "a",
        { class: "embed-card", href: info.url, target: "_blank", rel: "noopener noreferrer" },
        ["span", { class: "embed-card-kind" }, KIND_LABEL[info.kind]],
        ["span", { class: "embed-card-url" }, display],
      ],
    ];
  },
});
