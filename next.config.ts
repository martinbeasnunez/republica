import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ─── SEO: Redirect old routes ──────────────────────────
  async redirects() {
    return [
      {
        source: "/planes/comparar",
        destination: "/planes",
        permanent: true,
      },
      {
        source: "/resumen",
        destination: "/pe",
        permanent: true,
      },
      {
        source: "/dashboard",
        destination: "/pe",
        permanent: true,
      },
    ];
  },

  // ─── SEO: Security & caching headers ──────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: "/candidatos/:path*.(jpg|jpeg|png|webp|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
