/**
 * Share-card rendering for next/og. Cards are drawn from JSX with inline styles
 * (next/og supports a subset of CSS: flexbox, no grid).
 */
import { ImageResponse } from "next/og";
import { author, site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

const STAMP_HEX: Record<string, string> = { confirmed: "#0b7a5e", busted: "#c8412b", weird: "#2b5ba8", inconclusive: "#5f6673" };

/** Fetches just the glyphs we need from Google Fonts. Returns null if offline. */
async function loadFont(family: string, weight: number, text: string, italic = false): Promise<ArrayBuffer | null> {
  try {
    const axis = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:${axis}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return src ? await (await fetch(src)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

type Card = { kicker: string; title: string; subtitle?: string | null; stamp?: string | null };

export async function renderCard({ kicker, title, subtitle, stamp }: Card): Promise<ImageResponse> {
  const allText = `${kicker}${title}${subtitle ?? ""}${stamp ?? ""}${author.name}${site.name}/·`;
  const [serif, serifItalic, mono] = await Promise.all([
    loadFont("Newsreader", 500, allText),
    loadFont("Newsreader", 400, subtitle ?? "", true),
    loadFont("IBM Plex Mono", 400, allText),
  ]);
  const fonts = [
    serif && { name: "Newsreader", data: serif, weight: 500 as const, style: "normal" as const },
    serifItalic && { name: "Newsreader", data: serifItalic, weight: 400 as const, style: "italic" as const },
    mono && { name: "Plex Mono", data: mono, weight: 400 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));

  const titleSize = title.length > 70 ? 58 : title.length > 40 ? 68 : 80;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f6f3ea", color: "#1d2430", padding: "64px 72px", fontFamily: "Newsreader" }}>
        <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 26, color: "#5f6673" }}>
          {site.name} / {kicker}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: titleSize, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
          {subtitle && <div style={{ marginTop: 22, fontSize: 34, fontStyle: "italic", color: "#5f6673", maxWidth: 980 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "2px solid #1d2430", paddingTop: 24 }}>
          <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 24 }}>{author.name}</div>
          {stamp && (
            <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 26, color: STAMP_HEX[stamp] ?? "#5f6673", border: `3px solid ${STAMP_HEX[stamp] ?? "#5f6673"}`, borderRadius: 6, padding: "4px 16px", transform: "rotate(-3deg)" }}>
              {stamp}
            </div>
          )}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
