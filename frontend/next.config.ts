import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com"],
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: ["react-icons", "lodash", "framer-motion", "lucide-react", "fi"],
  },
  turbopack: {
    // Keep Turbopack scoped to the standalone frontend package.
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
