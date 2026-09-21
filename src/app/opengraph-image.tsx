import { OG_SIZE, renderCard } from "@/lib/og";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = site.fullName;

export default function Image() {
  return renderCard({ kicker: "lab", title: "I try things so I understand them.", subtitle: "Then I write down what broke." });
}
