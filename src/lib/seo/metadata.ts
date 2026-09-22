/**
 * Shared page-metadata pieces. Next merges metadata shallowly: a page that sets
 * `alternates` replaces the layout's whole `alternates` object, so the RSS link
 * is re-added here alongside each page's canonical URL.
 */
import type { Metadata } from "next";

export function pageAlternates(path: string, extra: Record<string, string> = {}): Metadata["alternates"] {
  return { canonical: path, types: { "application/rss+xml": "/rss.xml", ...extra } };
}
