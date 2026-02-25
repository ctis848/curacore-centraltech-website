/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [  // ← modern & safer replacement for domains
      {
        protocol: 'https',
        hostname: 'nkybsfygkmmzmwoadopc.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ctistech.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ctistech.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/lander',
        destination: '/',
        permanent: true,  // 301 permanent redirect
      },
      // You can add more redirects later if needed, e.g.:
      // {
      //   source: '/old-page',
      //   destination: '/new-page',
      //   permanent: true,
      // },
    ];
  },
};

export default nextConfig;