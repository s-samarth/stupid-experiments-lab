"use client";

import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react/menus";
import { promptForLink } from "./link";
import { usePrompt } from "./PromptDialog";

const btn = "rounded px-2 py-1 text-[13px] text-paper hover:bg-white/15";

/** Small dark bar above selected text: the quickest formatting, like Substack's. */
export function SelectionBubble({ editor }: { editor: Editor }) {
  const ask = usePrompt();
  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e, state }) => !state.selection.empty && e.isEditable && !e.isActive("figure") && !e.isActive("codeBlock")}
      className="flex items-center gap-0.5 rounded-note bg-ink p-1 shadow-lg"
    >
      <button type="button" className={`${btn} font-bold`} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
      <button type="button" className={`${btn} font-serif italic`} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
      <button type="button" className={`${btn} line-through`} onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
      <button type="button" className={btn} onClick={() => promptForLink(editor, ask)}>link</button>
      <button type="button" className={btn} onClick={() => editor.chain().focus().setNode("heading", { level: 2 }).run()}>H</button>
      <button type="button" className={btn} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“</button>
    </BubbleMenu>
  );
}
