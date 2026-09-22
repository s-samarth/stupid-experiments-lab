/**
 * The fixed shape of a new post: one section heading per step of the loop,
 * each followed by an empty paragraph. The editor shows each step's prompt as
 * placeholder text in that paragraph (see client-extensions.ts), so nothing
 * gets published by accident if a section is left empty.
 */
import type { JSONContent } from "@tiptap/core";
import { LOOP_STAGES } from "@/lib/loop";

type Seed = { question?: string; askedBy?: string | null };

export function loopTemplate({ question, askedBy }: Seed = {}): JSONContent {
  const content: JSONContent[] = [];
  for (const stage of LOOP_STAGES) {
    content.push({ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: stage.label }] });
    if (stage.key === "question" && question) {
      content.push(paragraph(question));
      if (askedBy) content.push(paragraph(`Asked by ${askedBy} in the question box.`, "italic"));
    } else {
      content.push({ type: "paragraph" });
    }
  }
  return { type: "doc", content };
}

function paragraph(text: string, mark?: "italic"): JSONContent {
  return { type: "paragraph", content: [{ type: "text", text, ...(mark ? { marks: [{ type: mark }] } : {}) }] };
}
