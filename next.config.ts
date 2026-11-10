import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Pin the workspace root to this project so stray lockfiles in parent folders are ignored.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
