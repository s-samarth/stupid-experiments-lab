import type { Metadata, Viewport } from "next";
import { Caveat, IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import { author, site } from "@/lib/site";
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
  applicationName: site.name,
  authors: [{ name: author.name, url: "/about" }],
  creator: author.name,
  publisher: author.name,
  // Lets Google show large image previews and full-length snippets (and so AI Overviews can quote).
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  // Bing Webmaster Tools ownership check (public by design; safe to commit).
  verification: { other: { "msvalidate.01": "413E94CF781BAE11D8E0B2BFDB5B8636" } },
  openGraph: { siteName: site.fullName, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  alternates: { types: { "application/rss+xml": "/rss.xml" } },
};

/** Same paper colour as samarthsaraswat.com, for the phone browser bar. */
export const viewport: Viewport = { themeColor: "#F6F3EA" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fontVars = [newsreader, inter, plexMono, caveat].map((f) => f.variable).join(" ");
  return (
    <html lang="en" className={fontVars}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
