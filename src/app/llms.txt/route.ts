import { listLivePostDocs } from "@/lib/queries/posts";
import { llmsIndex, textResponse } from "@/lib/seo/llms";

export const dynamic = "force-dynamic";

/** A Markdown map of the site for AI agents (see lib/seo/llms.ts). */
export async function GET() {
  return textResponse(llmsIndex(await listLivePostDocs()));
}
