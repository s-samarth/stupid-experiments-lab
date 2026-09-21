import type { Metadata } from "next";
import { Caveat, IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// next/font self-hosts these at build time: no request to Google from readers,
// and no layout shift while fonts load. Each exposes a CSS variable used in globals.css.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
});
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.fullName, template: `%s · ${site.name}` },
  description: site.tagline,
  openGraph: { siteName: site.fullName, type: "website" },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontVars = [newsreader, inter, plexMono, caveat].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fontVars}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
