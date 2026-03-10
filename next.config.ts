import type { NextConfig } from "next";

type HeaderEntry = {
  key: string;
  value: string;
};

const isProd = process.env.NODE_ENV === "production";
const useMapbox = process.env.NEXT_PUBLIC_USE_MAPBOX === "true";

const getCSP = (): string => {
  const scriptSrc = [
    "'self'",
    // Mantener inline evita romper hydration de Next sin nonces.
    "'unsafe-inline'",
    ...(isProd ? [] : ["'unsafe-eval'"])
    // "blob:",
  ];

  const styleSrc = ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"];

  const imgSrc = ["'self'", "data:", "blob:", "https://anriverax.s3.us-east-2.amazonaws.com"];

  const fontSrc = ["'self'", "data:", "https://cdn.jsdelivr.net"];

  const connectSrc = [
    "'self'",
    ...(isProd
      ? []
      : ["http://localhost:3001", "http://localhost:*", "http://127.0.0.1:*", "ws:", "wss:"])
  ];

  const workerSrc = ["'self'"];

  if (useMapbox) {
    scriptSrc.push("https://api.mapbox.com", "https://events.mapbox.com", "'wasm-unsafe-eval'");

    styleSrc.push("https://api.mapbox.com");

    imgSrc.push("https://api.mapbox.com", "https://*.tiles.mapbox.com");

    connectSrc.push("https://api.mapbox.com", "https://events.mapbox.com", "https://*.tiles.mapbox.com");

    workerSrc.push("blob:");
  }

  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    `style-src ${styleSrc.join(" ")}`,
    `img-src ${imgSrc.join(" ")}`,
    `font-src ${fontSrc.join(" ")}`,
    `connect-src ${connectSrc.join(" ")}`,
    `worker-src ${workerSrc.join(" ")}`,
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "manifest-src 'self'",
    ...(isProd ? ["upgrade-insecure-requests"] : [])
  ].join("; ");
};

const getSecurityHeaders = (): HeaderEntry[] => {
  const headers = [
    { key: "Content-Security-Policy", value: getCSP() },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(self)"
    }
  ];

  if (isProd) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains; preload"
    });
  }

  return headers;
};

const getCorsHeaders = (): HeaderEntry[] => {
  const origin = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

  return [
    { key: "Access-Control-Allow-Origin", value: origin },
    {
      key: "Access-Control-Allow-Methods",
      value: "GET, POST, PUT, DELETE, OPTIONS"
    },
    {
      key: "Access-Control-Allow-Headers",
      value: "Content-Type, Authorization"
    },
    { key: "Access-Control-Allow-Credentials", value: "true" }
  ];
};

const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders()
      },
      {
        source: "/api/:path*",
        headers: getCorsHeaders()
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "anriverax.s3.us-east-2.amazonaws.com",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
