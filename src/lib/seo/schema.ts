/**
 * Structured data (schema.org JSON-LD). Search engines and AI answer engines read
 * it to know, without guessing, what a page is, who wrote it and when. Every node
 * has a stable `@id`, so the post, the site and the author link up as one graph.
 */
import { author, site } from "@/lib/site";

export const PERSON_ID = `${site.url}/about#person`;
export const WEBSITE_ID = `${site.url}/#website`;

export function personSchema() {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: author.name,
    url: `${site.url}/about`,
    jobTitle: author.role,
    description: author.bio[0],
    // sameAs ties this person to their other profiles (a strong identity signal).
    sameAs: author.socials.filter((s) => s.href.startsWith("http")).map((s) => s.href),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.fullName,
    alternateName: site.name,
    description: site.tagline,
    inLanguage: "en",
    publisher: { "@id": PERSON_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${site.url}/writing?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export type PostForSchema = {
  slug: string;
  title: string;
  description: string;
  publishedAt: Date | null;
  updatedAt: Date;
  tags: string[];
  wordCount: number;
  image: string;
};

export function blogPostingSchema(p: PostForSchema) {
  const url = `${site.url}/p/${p.slug}`;
  return {
    "@type": "BlogPosting",
    "@id": `${url}#post`,
    url,
    mainEntityOfPage: url,
    headline: p.title.slice(0, 110),
    description: p.description,
    image: p.image,
    datePublished: p.publishedAt?.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    author: { "@id": PERSON_ID, "@type": "Person", name: author.name, url: `${site.url}/about` },
    publisher: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
    keywords: p.tags.join(", ") || undefined,
    wordCount: p.wordCount,
    // The markdown copy, for agents that prefer plain text.
    encoding: { "@type": "MediaObject", encodingFormat: "text/markdown", contentUrl: `${url}.md` },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${site.url}${it.path}` })),
  };
}

/** Wraps nodes into one JSON-LD document. */
export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });
