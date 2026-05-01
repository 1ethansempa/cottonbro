import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const apiUrl =
  process.env.API_BASE_URL || (isDev ? "http://localhost:3001" : "");

if (!apiUrl) {
  throw new Error("Missing API_BASE_URL");
}

const connectSrc = [
  "'self'",
  "https://*.googleapis.com",
  "https://www.googleapis.com",
  "https://fonts.gstatic.com",
  "https://*.cloudflare.com",
  "http://localhost:8000",
  "https://*.google.com",
];

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "font-src 'self' https://fonts.gstatic.com data:",
  "frame-src 'self' https://cottonbro-dev.firebaseapp.com https://*.cottonbro.com https://www.gstatic.com https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: csp,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    return [
      // Proxy API requests through Next.js so cookies work on same origin
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
