import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Production (Railway): backoffice serves /uploads and /objects
      {
        protocol: "https",
        hostname: "backoffice-production-d5cd.up.railway.app",
        pathname: "/**",
      },
      // Supabase storage (if product images use Supabase URLs)
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/**",
      },
      // Local dev only
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "localhost", port: "3002", pathname: "/**" },
      { protocol: "https", hostname: "localhost", pathname: "/**" },
    ],
  },
};

export default nextConfig;
