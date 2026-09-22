import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { PostFooter } from "@/components/lab/PostFooter";
import { PostHeader } from "@/components/lab/PostHeader";
import { ReadingProgress } from "@/components/lab/ReadingProgress";
import { ReadTracker } from "@/components/lab/ReadTracker";
import { SectionRail } from "@/components/lab/SectionRail";
import { listSections } from "@/lib/editor/render";
import { getLivePost, getNeighbours } from "@/lib/queries/posts";
import type { JSONContent } from "@tiptap/core";
import { JsonLd } from "@/components/site/JsonLd";
import type { posts } from "@/lib/db";
import { countWords } from "@/lib/editor/render";
import { docExcerpt } from "@/lib/seo/markdown";
import { pageAlternates } from "@/lib/seo/metadata";
import { blogPostingSchema, breadcrumbSchema, graph } from "@/lib/seo/schema";
import { author, site } from "@/lib/site";

type Post = typeof posts.$inferSelect;

export const dynamic = "force-dynamic";

const ARTICLE_ID = "article";

/** What search results and share previews say about a post. */
function describe(post: Post) {
  const description = post.seoDescription ?? post.subtitle ?? docExcerpt(post.body as JSONContent);
  const image = post.socialImage ?? `${site.url}/p/${post.slug}/card`;
  return { title: post.seoTitle ?? post.title, description, image };
}

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await getLivePost(slug);
  if (!found) return {};
  const { post } = found;
  const { title, description, image } = describe(post);
  const images = [{ url: image, width: 1200, height: 630, alt: post.title }];
  return {
    title,
    description,
    authors: [{ name: author.name, url: `${site.url}/about` }],
    keywords: post.tags,
    alternates: pageAlternates(`/p/${post.slug}`, { "text/markdown": `/p/${post.slug}.md` }),
    openGraph: {
      type: "article",
      url: `/p/${post.slug}`,
      title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [`${site.url}/about`],
      tags: post.tags,
      images,
    },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function PostPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const found = await getLivePost(slug);
  if (!found) notFound();
  const { post, reads } = found;

  const { older, newer } = await getNeighbours(post.publishedAt ?? new Date());
  const sections = listSections(post.bodyHtml);
  const { description, image } = describe(post);
  const schema = graph(
    blogPostingSchema({ ...post, description, image, wordCount: countWords(post.body as JSONContent) }),
    breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Writing", path: "/writing" }, { name: post.title, path: `/p/${post.slug}` }]),
  );

  return (
    <>
      <JsonLd data={schema} />
      <ReadingProgress targetId={ARTICLE_ID} />
      <ReadTracker postId={post.id} articleId={ARTICLE_ID} />
      <div className="mx-auto grid max-w-5xl gap-8 px-5 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[160px_minmax(0,680px)] lg:gap-12">
        <aside className="hidden lg:block">
          {sections.length > 1 && (
            <div className="sticky top-10">
              <SectionRail sections={sections} />
            </div>
          )}
        </aside>
        <article id={ARTICLE_ID} className="min-w-0">
          <PostHeader
            title={post.title}
            subtitle={post.subtitle}
            publishedAt={post.publishedAt}
            readingMinutes={post.readingMinutes}
            reads={reads}
            tags={post.tags}
          />
          {/* bodyHtml was rendered from our own editor schema at save time (see lib/editor/render.ts). */}
          <div className="prose-lab" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          <PostFooter
            postId={post.id}
            slug={post.slug}
            url={`${site.url}/p/${post.slug}`}
            title={post.title}
            reads={reads}
            older={older}
            newer={newer}
          />
        </article>
      </div>
    </>
  );
}
