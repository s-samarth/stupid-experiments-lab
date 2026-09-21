import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { HypothesisCard } from "@/components/lab/HypothesisCard";
import { LoopTracker } from "@/components/lab/LoopTracker";
import { PostFooter } from "@/components/lab/PostFooter";
import { PostHeader } from "@/components/lab/PostHeader";
import { ReadingProgress } from "@/components/lab/ReadingProgress";
import { ReadTracker } from "@/components/lab/ReadTracker";
import { getExperiment } from "@/lib/queries/experiments";
import { getLivePost, listExperimentEntries } from "@/lib/queries/posts";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const ARTICLE_ID = "article";

export async function generateMetadata(props: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const found = await getLivePost(slug);
  if (!found) return {};
  const { post } = found;
  const description = post.seoDescription ?? post.subtitle ?? undefined;
  return {
    title: post.seoTitle ?? post.title,
    description,
    alternates: { canonical: `/p/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.seoTitle ?? post.title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      ...(post.socialImage ? { images: [post.socialImage] } : {}),
    },
  };
}

export default async function PostPage(props: PageProps<"/p/[slug]">) {
  const { slug } = await props.params;
  const found = await getLivePost(slug);
  if (!found) notFound();
  const { post, reads } = found;

  const [context, entries] = post.experimentId
    ? await Promise.all([getExperiment({ id: post.experimentId }), listExperimentEntries(post.experimentId)])
    : [null, []];
  const experiment = context?.experiment ?? null;
  const index = entries.findIndex((e) => e.id === post.id);
  const next = index >= 0 ? (entries[index + 1] ?? null) : null;

  return (
    <>
      <ReadingProgress targetId={ARTICLE_ID} />
      <ReadTracker postId={post.id} articleId={ARTICLE_ID} />
      <div className="mx-auto grid max-w-5xl gap-8 px-5 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[140px_minmax(0,680px)] lg:gap-12">
        <aside className="hidden lg:block" aria-label="Where this sits in the loop">
          {experiment && (
            <div className="sticky top-10">
              <LoopTracker current={experiment.stage} here={post.stage} />
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
            experimentNumber={experiment?.number}
            entryIndex={index + 1}
            entryTotal={entries.length}
          />
          {experiment && post.kind === "log" && (
            <div className="mb-8">
              <HypothesisCard {...experiment} />
            </div>
          )}
          {/* bodyHtml was rendered from our own editor schema at save time (see lib/editor/render.ts). */}
          <div className="prose-lab" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
          <PostFooter
            postId={post.id}
            slug={post.slug}
            url={`${site.url}/p/${post.slug}`}
            title={post.title}
            reads={reads}
            experiment={experiment}
            parent={context?.parent ?? null}
            next={next}
            entryTotal={entries.length}
          />
        </article>
      </div>
    </>
  );
}
