import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // ⭐ Force Webpack instead of Turbopack (Next.js 16 supported way)
  webpack: (config) => {
    return config;
  },

  // ⭐ Disable Turbopack by enabling Webpack compiler
  compiler: {},
};

export default nextConfig;
