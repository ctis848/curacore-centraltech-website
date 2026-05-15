/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ⭐ FORCE WEBPACK INSTEAD OF TURBOPACK
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
    turbo: false, // <— THIS DISABLES TURBOPACK
  },
};

export default nextConfig;
