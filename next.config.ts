/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    remotePatterns: [
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
      // Catch old /portal/dashboard and all /portal paths
      {
        source: '/portal/dashboard',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/portal/:path*',
        destination: '/dashboard/:path*',
        permanent: true,
      },

      // Your original lander fix
      {
        source: '/lander',
        destination: '/',
        permanent: true,
      },
    ];
  },

  trailingSlash: false,
};

export default nextConfig;