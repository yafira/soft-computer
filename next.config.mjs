/** @type {import('next').NextConfig} */
const nextConfig = {
  // the build guide used to live at /make
  async redirects() {
    return [{ source: "/make", destination: "/diy", permanent: true }];
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
