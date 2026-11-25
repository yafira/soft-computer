/** @type {import('next').NextConfig} */
const nextConfig = {
  // the build guide used to live at /make
  async redirects() {
    return [{ source: "/make", destination: "/diy", permanent: true }];
  },
  // the tiny soft computer workshop site lives in its own project,
  // served here so it shows up at thesoft.computer/tiny
  async rewrites() {
    return [
      {
        source: "/tiny",
        destination: "https://tiny-soft-computer.vercel.app/tiny",
      },
      {
        source: "/tiny/:path*",
        destination: "https://tiny-soft-computer.vercel.app/tiny/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      // (optional) sometimes blobs use the non-public hostname too
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
