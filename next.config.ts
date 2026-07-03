import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },

  // ⭐ Explicitly disable Turbopack by providing an empty config
  turbopack: {},

  // ⭐ Force Webpack build
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
