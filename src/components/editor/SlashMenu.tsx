"use client";

import type { Editor } from "@tiptap/core";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { filterItems, type InsertContext, type InsertItem } from "./insert-items";
import { usePrompt } from "./PromptDialog";

type Open = { query: string; from: number; to: number; top: number; left: number };

/** Reads "/query" at the start of the current paragraph, if the cursor is right after it. */
function readSlash(editor: Editor): Open | null {
  const { selection } = editor.state;
  if (!selection.empty) return null;
  const { $from } = selection;
  if ($from.parent.type.name !== "paragraph") return null;
  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
  const match = before.match(/^\/([\w ]{0,20})$/);
  if (!match) return null;
  const coords = editor.view.coordsAtPos(selection.from);
  return { query: match[1], from: $from.start(), to: selection.from, top: coords.bottom + 6, left: coords.left };
}

export function SlashMenu({ editor, notify }: { editor: Editor; notify: InsertContext["notify"] }) {
  const ask = usePrompt();
  const [open, setOpen] = useState<Open | null>(null);
  const [active, setActive] = useState(0);
  const items = open ? filterItems(open.query) : [];
  // Refs let the keydown listener (attached once) see the latest values.
  // They're synced after each render, never written during it.
  const latest = useRef({ open, items, active });

  const choose = (item: InsertItem) => {
    const o = latest.current.open;
    if (!o) return;
    editor.chain().focus().deleteRange({ from: o.from, to: o.to }).run();
    setOpen(null);
    void item.run(editor, { ask, notify });
  };
  const chooseRef = useRef(choose);
  useLayoutEffect(() => {
    latest.current = { open, items, active };
    chooseRef.current = choose;
  });

  useEffect(() => {
    const update = () => {
      const next = readSlash(editor);
      setOpen(next);
      if (!next) setActive(0);
    };
    const onKey = (e: KeyboardEvent) => {
      const { open: o, items: list, active: a } = latest.current;
      if (!o || list.length === 0) return;
      const keys: Record<string, () => void> = {
        ArrowDown: () => setActive((a + 1) % list.length),
        ArrowUp: () => setActive((a - 1 + list.length) % list.length),
        Enter: () => chooseRef.current(list[a]),
        Escape: () => setOpen(null),
      };
      const handler = keys[e.key];
      if (!handler) return;
      e.preventDefault();
      e.stopPropagation();
      handler();
    };
    editor.on("transaction", update);
    const dom = editor.view.dom;
    dom.addEventListener("keydown", onKey, true);
    return () => {
      editor.off("transaction", update);
      dom.removeEventListener("keydown", onKey, true);
    };
  }, [editor]);

  if (!open || items.length === 0) return null;
  return (
    <ul
      role="listbox"
      aria-label="Insert a block"
      style={{ top: open.top, left: open.left }}
      className="fixed z-30 max-h-72 w-64 overflow-auto rounded-note border border-line bg-card py-1 shadow-lg"
    >
      {items.map((item, i) => (
        <li key={item.key} role="option" aria-selected={i === active}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => choose(item)}
            onMouseEnter={() => setActive(i)}
            className={`flex w-full items-baseline justify-between px-3 py-1.5 text-left text-[13px] ${i === active ? "bg-amber-soft" : ""}`}
          >
            <span>{item.label}</span>
            <span className="text-[11px] text-muted">{item.group === "lab" ? "lab" : item.hint}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
