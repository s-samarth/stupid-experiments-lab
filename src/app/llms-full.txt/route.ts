import { listLivePostDocs } from "@/lib/queries/posts";
import { llmsFull, textResponse } from "@/lib/seo/llms";

export const dynamic = "force-dynamic";

/** Every published post as Markdown, in one file (see lib/seo/llms.ts). */
export async function GET() {
  return textResponse(llmsFull(await listLivePostDocs()));
}
