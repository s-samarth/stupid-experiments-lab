"use client";

import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { formatChartValue, parseChartCsv } from "@/lib/editor/nodes/data-chart";
import { usePrompt } from "../PromptDialog";

/** Same markup as the published chart; click it to edit the data. */
export function DataChartView({ node, updateAttributes, selected }: ReactNodeViewProps) {
  const ask = usePrompt();
  const rows = parseChartCsv(node.attrs.csv as string);

  async function edit() {
    const r = await ask({
      title: "Chart data",
      submitLabel: "Save",
      fields: [
        { name: "csv", label: "One row per line: label, value", multiline: true, defaultValue: node.attrs.csv as string, required: true },
        { name: "caption", label: "Caption", defaultValue: node.attrs.caption as string },
      ],
    });
    if (r) updateAttributes(r);
  }

  return (
    <NodeViewWrapper as="figure" className={`data-chart ${selected ? "outline-2 outline-offset-4 outline-pen" : ""}`} data-drag-handle>
      <button type="button" onClick={edit} className="data-chart-rows w-full text-left" title="Click to edit the data">
        {rows.length === 0 && <span className="text-muted">No numbers found. Click to add data.</span>}
        {rows.map((r) => (
          <span key={r.label} className="data-chart-row">
            <span className="data-chart-label">{r.label}</span>
            <span className="data-chart-track">
              <span className="data-chart-fill" style={{ width: `${r.pct}%` }} />
            </span>
            <span className="data-chart-value">{formatChartValue(r.value)}</span>
          </span>
        ))}
      </button>
      {node.attrs.caption && <figcaption>{node.attrs.caption as string}</figcaption>}
    </NodeViewWrapper>
  );
}
