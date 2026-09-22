import "katex/dist/katex.min.css";
import "@/styles/editor.css";
import { PostEditor } from "@/components/editor/PostEditor";
import { PromptProvider } from "@/components/editor/PromptDialog";
import { loopTemplate } from "@/lib/editor/template";
import { draftSlug } from "@/lib/slug";

/**
 * A new post, opened straight from the template. Nothing is written to the
 * database here: the editor creates the draft on its first save with content,
 * so leaving this page without typing leaves nothing behind.
 */
export default function NewPostPage() {
  return (
    <PromptProvider>
      <PostEditor
        post={{
          id: null,
          title: "",
          subtitle: null,
          body: loopTemplate(),
          status: "draft",
          slug: draftSlug(),
          tags: [],
          seoTitle: null,
          seoDescription: null,
          socialImage: null,
        }}
      />
    </PromptProvider>
  );
}
