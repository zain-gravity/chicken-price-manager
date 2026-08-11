import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel serverless deployment
  serverExternalPackages: ['mongoose', 'bcryptjs'],

  // Image optimization
  images: {
    domains: [],
  },
};

export default nextConfig;
