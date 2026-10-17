import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Next.js injects inline bootstrap scripts, so script-src needs 'unsafe-inline' unless
// every page is rendered with a nonce. The rest of the policy is strict: no plugins,
// no framing, forms and <base> locked to this origin.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://vercel.live`,
  "style-src 'self' 'unsafe-inline' https://vercel.live",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com https://storage.googleapis.com https://vercel.live https://vercel.com",
  "font-src 'self' data: https://vercel.live",
  "connect-src 'self' https://vercel.live wss://ws-us3.pusher.com",
  "frame-src https://vercel.live",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

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
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
