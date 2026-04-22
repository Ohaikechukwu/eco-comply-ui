import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ hostname: "res.cloudinary.com" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "https://ecocomply.ddns.net/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;