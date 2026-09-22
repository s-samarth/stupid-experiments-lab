import type { JSONContent } from "@tiptap/core";
import { notFound } from "next/navigation";
import "katex/dist/katex.min.css";
import "@/styles/editor.css";
import { PostEditor } from "@/components/editor/PostEditor";
import { PromptProvider } from "@/components/editor/PromptDialog";
import { getPostForEdit } from "@/lib/admin/queries";

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]">) {
  const { id } = await props.params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();
  const post = await getPostForEdit(postId);
  if (!post) notFound();

  return (
    <PromptProvider>
      {/* key: a different post remounts the editor instead of reusing its state. */}
      <PostEditor
        key={post.id}
        post={{
          id: post.id,
          title: post.title,
          subtitle: post.subtitle,
          body: post.body as JSONContent,
          status: post.status,
          slug: post.slug,
          tags: post.tags,
          seoTitle: post.seoTitle,
          seoDescription: post.seoDescription,
          socialImage: post.socialImage,
        }}
      />
    </PromptProvider>
  );
}
