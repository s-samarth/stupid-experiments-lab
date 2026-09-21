"use client";

/** Node views for small atoms: footnote markers, buttons and verdict stamps. Click to edit. */
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { VERDICTS, VERDICT_COLOR, type Verdict } from "@/lib/loop";
import { usePrompt } from "../PromptDialog";

export function FootnoteView({ node, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const ask = usePrompt();
  async function edit() {
    const r = await ask({
      title: "Edit footnote",
      submitLabel: "Save",
      fields: [{ name: "text", label: "Note (leave empty to delete)", multiline: true, defaultValue: node.attrs.text as string }],
    });
    if (!r) return;
    if (r.text) updateAttributes({ text: r.text });
    else deleteNode();
  }
  return (
    <NodeViewWrapper as="sup" className="fn">
      {/* The number itself comes from a CSS counter (see editor.css). */}
      <button type="button" onClick={edit} className="fn-ref" data-note={node.attrs.text} title={node.attrs.text as string} />
    </NodeViewWrapper>
  );
}

export function ButtonView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const ask = usePrompt();
  async function edit() {
    const r = await ask({
      title: "Edit button",
      submitLabel: "Save",
      fields: [
        { name: "label", label: "Label", defaultValue: node.attrs.label as string, required: true },
        { name: "href", label: "Link", defaultValue: node.attrs.href as string, required: true },
      ],
    });
    if (r) updateAttributes(r);
  }
  return (
    <NodeViewWrapper className={`button-block ${selected ? "outline-2 outline-offset-4 outline-pen" : ""}`} data-drag-handle>
      <button type="button" onClick={edit} title="Click to edit">
        {node.attrs.label as string}
      </button>
    </NodeViewWrapper>
  );
}

export function VerdictView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const verdict = node.attrs.verdict as Verdict;
  const cycle = () => updateAttributes({ verdict: VERDICTS[(VERDICTS.indexOf(verdict) + 1) % VERDICTS.length] });
  return (
    <NodeViewWrapper as="p" className={`verdict-line ${selected ? "outline-2 outline-offset-4 outline-pen" : ""}`} data-drag-handle>
      <button type="button" onClick={cycle} title="Click to change the verdict" className={`stamp ${VERDICT_COLOR[verdict] ?? ""}`}>
        {verdict}
      </button>
    </NodeViewWrapper>
  );
}
