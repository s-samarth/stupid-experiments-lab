"use client";

import type { JSONContent } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useMemo, useRef, useState } from "react";
import { createDraft, savePost } from "@/lib/admin/post-actions";
import { promptForHeading } from "@/lib/loop";
import { clientExtensions } from "./client-extensions";
import { EditorTopBar } from "./EditorTopBar";
import { usePrompt } from "./PromptDialog";
import { SelectionBubble } from "./SelectionBubble";
import { SettingsPanel, type PostSettings } from "./SettingsPanel";
import { SlashMenu } from "./SlashMenu";
import { Toolbar } from "./Toolbar";
import { useAutosave } from "./useAutosave";
import { useToast } from "./useToast";

export type EditablePost = PostSettings & {
  /** null for a brand-new post that hasn't been saved yet. */
  id: number | null;
  title: string;
  subtitle: string | null;
  body: JSONContent;
  status: "draft" | "scheduled" | "published";
};

type Snapshot = Parameters<typeof savePost>[1];

export function PostEditor({ post }: { post: EditablePost }) {
  const ask = usePrompt();
  const { toast, notify } = useToast();
  const [postId, setPostId] = useState(post.id);
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(post.subtitle ?? "");
  const [body, setBody] = useState<JSONContent>(post.body);
  const [settings, setSettings] = useState<PostSettings>(post);
  const [showSettings, setShowSettings] = useState(false);
  // The id is also kept in a ref so the save callback always sees the newest one.
  const idRef = useRef(post.id);
  // Extensions are created once; node views read `ask` through React context.
  const extensions = useMemo(() => clientExtensions({ ask, notify }), [ask, notify]);

  const editor = useEditor({
    extensions,
    content: post.body,
    // Render on the client only: the editor needs the browser DOM.
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose-lab editor-surface min-h-[55vh] focus:outline-none", "aria-label": "Post body" } },
    onUpdate: ({ editor: e }) => setBody(e.getJSON()),
  });

  const save = useCallback(async (snapshot: Snapshot) => {
    if (idRef.current === null) {
      // First save: only creates the draft once there's something in it.
      const r = await createDraft(snapshot);
      if (!r.ok) return r.error;
      if (r.id === null) return null;
      idRef.current = r.id;
      setPostId(r.id);
      // Swap the address to the real post without reloading the editor.
      window.history.replaceState(null, "", `/admin/posts/${r.id}`);
      return null;
    }
    const r = await savePost(idRef.current, snapshot);
    return r.ok ? null : r.error;
  }, []);

  const snapshot: Snapshot = { ...settings, title, subtitle: subtitle || null, body: body as { type: "doc" } };
  const { status: saveStatus, error, flush } = useAutosave(snapshot, save);

  return (
    <div>
      <EditorTopBar
        postId={postId}
        status={post.status}
        slug={post.slug}
        saveStatus={saveStatus}
        saveError={error}
        flush={flush}
        currentId={() => idRef.current}
        wordCount={editor ? countWords(editor.state.doc) : 0}
        onToggleSettings={() => setShowSettings((s) => !s)}
        notify={notify}
      />
      {editor && (
        <div className="sticky top-[53px] z-10 border-b border-line bg-[#fbfaf6]/95 px-5 py-1.5 backdrop-blur">
          <Toolbar editor={editor} notify={notify} />
        </div>
      )}
      <div className={`mx-auto grid max-w-6xl gap-8 px-5 ${showSettings ? "lg:grid-cols-[minmax(0,1fr)_280px]" : ""}`}>
        <div className="mx-auto w-full max-w-[680px] py-10">
          <textarea
            value={title}
            onChange={(e) => setTitle(e.target.value.replace(/\n/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), editor?.commands.focus("start"))}
            placeholder="Title"
            aria-label="Title"
            rows={1}
            className="w-full resize-none bg-transparent font-serif text-[40px] leading-[1.1] field-sizing-content placeholder:text-line-strong focus:outline-none"
          />
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value.replace(/\n/g, ""))}
            placeholder="Add a subtitle…"
            aria-label="Subtitle"
            rows={1}
            className="mt-2 mb-8 w-full resize-none bg-transparent font-serif text-[21px] text-muted italic field-sizing-content placeholder:text-line-strong focus:outline-none"
          />
          <EditorContent editor={editor} />
          {editor && <SlashMenu editor={editor} notify={notify} />}
          {editor && <SelectionBubble editor={editor} />}
        </div>
        {showSettings && (
          <div className="border-l border-line py-8 pl-6">
            <SettingsPanel settings={settings} onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))} title={title} notify={notify} />
          </div>
        )}
      </div>
      {toast}
    </div>
  );
}

/** Words you've written, leaving out the template's own section headings. */
function countWords(doc: ProseMirrorNode): number {
  let n = 0;
  doc.descendants((node) => {
    if (node.type.name === "heading" && promptForHeading(node.textContent)) return false;
    if (node.isText) n += (node.text ?? "").split(/\s+/).filter(Boolean).length;
  });
  return n;
}
