import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Prevent React double-invoking components in dev (big perf win)
  reactStrictMode: false,

  // Pin the project root so Tailwind v4 / postcss resolves packages
  // from THIS folder instead of crawling up to D:\Raka or higher
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
