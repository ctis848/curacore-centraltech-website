/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Modern image optimization (already good - kept as-is)
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
      // Optional: add more CDNs if needed (e.g. for future image hosts)
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/**',
      // },
    ],
  },

  // Redirects: fixes old /portal paths and /lander
  async redirects() {
    return [
      // Fix your current 404 issue
      {
        source: '/portal/dashboard',
        destination: '/dashboard',
        permanent: true, // 301 - good for SEO
      },
      {
        source: '/portal/:path*', // catch-all for any /portal sub-paths
        destination: '/dashboard/:path*',
        permanent: true,
      },

      // Your original lander redirect
      {
        source: '/lander',
        destination: '/',
        permanent: true,
      },

      // Optional: more common redirects (uncomment if needed)
      // {
      //   source: '/old-login',
      //   destination: '/login',
      //   permanent: true,
      // },
      // {
      //   source: '/portal',
      //   destination: '/dashboard',
      //   permanent: true,
      // },
    ];
  },

  // Optional but recommended for Netlify/Vercel
  trailingSlash: false, // avoids duplicate content issues
  output: 'standalone', // useful for standalone builds (optional - remove if not needed)
};

export default nextConfig;