"use client";

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { INSERT_ITEMS, type InsertContext, type InsertItem } from "./insert-items";
import { promptForLink } from "./link";
import { usePrompt } from "./PromptDialog";

const STYLES = [
  { value: "p", label: "Normal text" },
  { value: "1", label: "Heading 1" },
  { value: "2", label: "Heading 2" },
  { value: "3", label: "Heading 3" },
  { value: "4", label: "Heading 4 (label)" },
];

const btn = "flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-[14px] text-ink hover:bg-paper-deep aria-pressed:bg-amber-soft";

export function Toolbar({ editor, notify }: { editor: Editor; notify: InsertContext["notify"] }) {
  const ask = usePrompt();
  // Re-renders only when one of these values changes, not on every keystroke.
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      style: [1, 2, 3, 4].find((l) => e.isActive("heading", { level: l }))?.toString() ?? "p",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      sup: e.isActive("superscript"),
      sub: e.isActive("subscript"),
      bullets: e.isActive("bulletList"),
      numbers: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
    }),
  });

  const setStyle = (v: string) => {
    const c = editor.chain().focus();
    if (v === "p") c.setParagraph().run();
    else c.setHeading({ level: Number(v) as 1 | 2 | 3 | 4 }).run();
  };
  const run = (item: InsertItem) => void item.run(editor, { ask, notify });
  const menu = (group: InsertItem["group"][]) => INSERT_ITEMS.filter((i) => group.includes(i.group));

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
      <select value={s.style} onChange={(e) => setStyle(e.target.value)} aria-label="Text style" className="mr-1 h-8 rounded border border-line bg-card px-2 text-[13px]">
        {STYLES.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button type="button" className={btn} aria-pressed={s.bold} aria-label="Bold (⌘B)" onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" className={btn} aria-pressed={s.italic} aria-label="Italic (⌘I)" onClick={() => editor.chain().focus().toggleItalic().run()}><i className="font-serif">I</i></button>
      <button type="button" className={btn} aria-pressed={s.strike} aria-label="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></button>
      <button type="button" className={`${btn} font-mono`} aria-pressed={s.code} aria-label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}>{"<>"}</button>
      <button type="button" className={btn} aria-pressed={s.link} aria-label="Link (⌘K)" onClick={() => promptForLink(editor, ask)}>link</button>
      <button type="button" className={btn} aria-pressed={s.sup} aria-label="Superscript" onClick={() => editor.chain().focus().toggleSuperscript().run()}>x²</button>
      <button type="button" className={btn} aria-pressed={s.sub} aria-label="Subscript" onClick={() => editor.chain().focus().toggleSubscript().run()}>x₂</button>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <button type="button" className={btn} aria-pressed={s.quote} aria-label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()}>“ ”</button>
      <button type="button" className={btn} aria-pressed={s.bullets} aria-label="Bulleted list" onClick={() => editor.chain().focus().toggleBulletList().run()}>• —</button>
      <button type="button" className={btn} aria-pressed={s.numbers} aria-label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.</button>
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <InsertMenu label="Insert" items={menu(["media", "basic"])} onPick={run} />
      <InsertMenu label="Lab blocks" items={menu(["lab"])} onPick={run} accent />
    </div>
  );
}

/** A <details> dropdown: opens and closes without any state of its own. */
function InsertMenu({ label, items, onPick, accent }: { label: string; items: InsertItem[]; onPick: (i: InsertItem) => void; accent?: boolean }) {
  return (
    <details className="group relative">
      <summary className={`${btn} cursor-pointer list-none gap-1 ${accent ? "bg-amber-soft" : ""}`}>
        {label} <span aria-hidden className="text-[10px]">▾</span>
      </summary>
      <ul className="absolute left-0 z-20 mt-1 max-h-80 w-56 overflow-auto rounded-note border border-line bg-card py-1 shadow-md">
        {items.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              className="flex w-full justify-between px-3 py-1.5 text-left text-[13px] hover:bg-paper-deep"
              onClick={(e) => {
                e.currentTarget.closest("details")?.removeAttribute("open");
                onPick(item);
              }}
            >
              <span>{item.label}</span>
              <span className="text-[11px] text-muted">{item.hint}</span>
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
