import type { NextConfig } from "next";

const apiUrl = process.env.API_BASE_URL;
const assetsBaseUrl = process.env.NEXT_PUBLIC_ASSETS_BASE_URL;

if (!apiUrl) {
  throw new Error("Missing API_BASE_URL");
}

if (!assetsBaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_ASSETS_BASE_URL");
}

const assetsUrl = new URL(assetsBaseUrl);

const connectSrc = [
  "'self'",
  "https://*.googleapis.com",
  "https://www.googleapis.com",
  "https://fonts.gstatic.com",
  "https://*.cloudflare.com",
  "http://localhost:8000",
  "https://*.google.com",
  "https://*.crisp.chat",
  "wss://client.relay.crisp.chat",
];

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.google.com https://*.cloudflare.com https://crisp.chat https://*.crisp.chat",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.crisp.chat",
  `img-src 'self' data: ${assetsUrl.origin}`,
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
  images: {
    remotePatterns: [
      {
        protocol: assetsUrl.protocol.replace(":", "") as "http" | "https",
        hostname: assetsUrl.hostname,
        port: assetsUrl.port,
        pathname: "/**",
      },
    ],
  },
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
