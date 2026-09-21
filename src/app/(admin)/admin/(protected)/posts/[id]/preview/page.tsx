import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import { PostHeader } from "@/components/lab/PostHeader";
import { getPostForEdit } from "@/lib/admin/queries";

/** Draft preview: exactly the public reading styles, visible only to the owner. */
export default async function PreviewPostPage(props: PageProps<"/admin/posts/[id]/preview">) {
  const { id } = await props.params;
  const post = await getPostForEdit(Number(id));
  if (!post) notFound();

  return (
    <div className="bg-paper">
      <p className="bg-amber-soft px-5 py-2 text-center font-mono text-[12px]">Preview · only you can see this · last saved version</p>
      <article className="mx-auto max-w-[680px] px-5 py-12">
        <PostHeader
          title={post.title || "Untitled"}
          subtitle={post.subtitle}
          publishedAt={post.publishedAt ?? new Date()}
          readingMinutes={post.readingMinutes}
          reads={0}
          tags={post.tags}
        />
        <div className="prose-lab" dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
      </article>
    </div>
  );
}
