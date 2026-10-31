import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/index.html",
        destination: "/",
      },
      {
        source: "/:slug.html",
        destination: "/blog/:slug",
      },
    ];
  },
};

export default nextConfig;

