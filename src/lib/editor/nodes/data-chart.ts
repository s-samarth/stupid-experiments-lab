/**
 * Data block: paste two-column CSV ("label,value"), get a horizontal bar chart.
 * Values are always printed, so the chart reads fine without seeing colour.
 */
import { Node } from "@tiptap/core";
import type { DOMOutputSpec } from "@tiptap/pm/model";

export type ChartRow = { label: string; value: number; pct: number };

/** Parses "label,value" lines; skips a header row and anything non-numeric. */
export function parseChartCsv(csv: string): ChartRow[] {
  const rows = csv
    .split(/\r?\n/)
    .map((line) => line.split(/[,\t]/).map((cell) => cell.trim()))
    // A value needs at least one digit; this also drops header rows like "week, return".
    .filter((cells) => cells.length >= 2 && cells[0] !== "" && /\d/.test(cells[1]))
    .map(([label, raw]) => ({ label, value: Number(raw.replace(/[^0-9.-]/g, "")) }))
    .filter((r) => Number.isFinite(r.value) && r.label.length > 0)
    .slice(0, 30);
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  return rows.map((r) => ({ ...r, pct: Math.round((Math.abs(r.value) / max) * 100) }));
}

export function formatChartValue(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}

export const DataChart = Node.create({
  name: "dataChart",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return { csv: { default: "" }, caption: { default: "" } };
  },

  parseHTML() {
    return [
      {
        tag: "figure.data-chart",
        getAttrs: (el) => ({ csv: el.getAttribute("data-csv") ?? "", caption: el.querySelector("figcaption")?.textContent ?? "" }),
      },
    ];
  },

  renderHTML({ node }) {
    const rows = parseChartCsv(node.attrs.csv).map(
      (r): DOMOutputSpec => [
        "div",
        { class: "data-chart-row" },
        ["span", { class: "data-chart-label" }, r.label],
        ["span", { class: "data-chart-track" }, ["span", { class: "data-chart-fill", style: `width:${r.pct}%` }]],
        ["span", { class: "data-chart-value" }, formatChartValue(r.value)],
      ],
    );
    const body: DOMOutputSpec = ["div", { class: "data-chart-rows" }, ...rows];
    const attrs = { class: "data-chart", "data-csv": node.attrs.csv };
    return node.attrs.caption ? ["figure", attrs, body, ["figcaption", {}, node.attrs.caption]] : ["figure", attrs, body];
  },
});
