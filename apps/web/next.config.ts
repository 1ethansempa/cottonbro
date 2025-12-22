import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const connectSrc = [
  "'self'",
  "https://cottonbro-api-491077850913.europe-west1.run.app",
  "https://identitytoolkit.googleapis.com",
  "https://securetoken.googleapis.com",
  "https://www.googleapis.com",
];

if (isDev) {
  connectSrc.push("http://localhost:3001");
}

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https:",
  `connect-src ${connectSrc.join(" ")}`,
  "font-src 'self' https://fonts.gstatic.com data:",
  "frame-src 'self' https://*.firebaseapp.com https://www.gstatic.com https://challenges.cloudflare.com",
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
    value: "camera=(), microphone=(), geolocation=()",
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
};

export default nextConfig;
