import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Self-contained server bundle for the Cloud Run container image.
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dcnttyw1vlhmejhy.public.blob.vercel-storage.com",
        port: "",
        pathname: "/product-images/**",
        search: "",
      },
      ...(process.env.GCS_BUCKET
        ? [{
            protocol: "https" as const,
            hostname: "storage.googleapis.com",
            port: "",
            pathname: `/${process.env.GCS_BUCKET}/product-images/**`,
            search: "",
          }]
        : []),
    ],
  },
  async redirects() {
    return [
      { source: "/lerning", destination: "/learning", permanent: true },
      { source: "/lerning/:slug*", destination: "/learning/:slug*", permanent: true },
      { source: "/hardware", destination: "/store", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
        ],
      },
    ];
  },
};

export default nextConfig;
