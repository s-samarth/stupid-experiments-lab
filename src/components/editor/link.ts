import type { Editor } from "@tiptap/core";
import type { Ask } from "./PromptDialog";

/** Asks for a URL and applies it to the selection. An empty URL removes the link. */
export async function promptForLink(editor: Editor, ask: Ask): Promise<void> {
  const current = (editor.getAttributes("link").href as string | undefined) ?? "";
  const r = await ask({
    title: current ? "Edit link" : "Add link",
    submitLabel: "Apply",
    fields: [{ name: "href", label: "URL (leave empty to remove)", defaultValue: current, placeholder: "https://" }],
  });
  if (!r) return;
  const chain = editor.chain().focus().extendMarkRange("link");
  if (!r.href) {
    chain.unsetLink().run();
    return;
  }
  const href = /^(https?:|mailto:|\/|#)/i.test(r.href) ? r.href : `https://${r.href}`;
  chain.setLink({ href }).run();
}
