import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experiments were folded into posts; send any old links to the writing list.
  async redirects() {
    return [
      { source: "/experiments", destination: "/writing", permanent: true },
      { source: "/experiments/:slug", destination: "/writing", permanent: true },
    ];
  },
};

export default nextConfig;
