/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      // The team portal is a static app in /public, and Next does not
      // resolve a directory path to its index.html on its own.
      { source: '/team-portal', destination: '/team-portal/index.html', permanent: false },
    ];
  },
};

export default nextConfig;
