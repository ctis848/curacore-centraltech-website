/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    domains: [
      'nkybsfygkmmzmwoadopc.supabase.co',
      'www.ctistech.com',
      'ctistech.com',
    ],
  },
};

export default nextConfig;