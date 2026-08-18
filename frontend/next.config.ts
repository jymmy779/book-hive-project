import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["res.cloudinary.com"],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["react-icons", "lodash", "framer-motion", "lucide-react", "fi"],
  },
};

export default nextConfig;
