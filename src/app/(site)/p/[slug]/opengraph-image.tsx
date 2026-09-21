import { OG_SIZE, renderCard } from "@/lib/og";
import { experimentCode } from "@/lib/loop";
import { getExperiment } from "@/lib/queries/experiments";
import { getLivePost } from "@/lib/queries/posts";
import { site } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Share card for this post";

/** The card people see when a post is shared on WhatsApp, LinkedIn or X. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getLivePost(slug);
  if (!found) return renderCard({ kicker: "lab", title: site.fullName });
  const { post } = found;
  const experiment = post.experimentId ? (await getExperiment({ id: post.experimentId }))?.experiment : null;
  return renderCard({
    kicker: experiment ? experimentCode(experiment.number) : post.kind,
    title: post.title,
    subtitle: post.subtitle,
    stamp: post.kind === "finding" ? experiment?.verdict : null,
  });
}
