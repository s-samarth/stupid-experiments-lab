import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experiments were folded into posts; send any old links to the writing list.
  async redirects() {
    return [
      { source: "/experiments", destination: "/writing", permanent: true },
      { source: "/experiments/:slug", destination: "/writing", permanent: true },
    ];
  },
  // Each post as Markdown for AI agents: /p/<slug>.md is served by app/md/[slug].
  async rewrites() {
    return [{ source: "/p/:slug.md", destination: "/md/:slug" }];
  },
};

export default nextConfig;
