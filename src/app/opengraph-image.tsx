import { OG_SIZE, renderCard } from "@/lib/og";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = site.fullName;

export default function Image() {
  return renderCard({ kicker: "lab", title: "Dumb ideas, actually tried.", subtitle: "Tested in public. Written up honestly." });
}
