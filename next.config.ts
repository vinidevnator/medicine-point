import type { NextConfig } from "next";

const allowedDevOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean) ?? ["localhost:3000"];

const isProd = process.env.NODE_ENV === "production";

// Next's App Router injects inline hydration scripts, so a nonce-less policy must
// permit 'unsafe-inline' for scripts; dev additionally needs 'unsafe-eval' for
// HMR. This is defense-in-depth alongside the other headers below; upgrade to a
// nonce-based policy (via proxy.ts) if stricter script control is required.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "no-referrer" },
  ...(isProd
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  allowedDevOrigins,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Preserve inbound links/bookmarks after the PT -> EN route renames.
    // Dynamic segments and query strings are carried over automatically.
    return [
      { source: "/entrar", destination: "/login", permanent: true },
      { source: "/cadastrar", destination: "/register", permanent: true },
      { source: "/busca", destination: "/search", permanent: true },
      { source: "/medicamento/:ean", destination: "/medicine/:ean", permanent: true },
      { source: "/pedido/:id", destination: "/order/:id", permanent: true },
    ];
  },
};

export default nextConfig;
