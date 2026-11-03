import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow both `localhost` and `127.0.0.1` to load dev resources. Next.js 16
  // blocks cross-origin dev resources by default; without this, hitting the
  // app via 127.0.0.1 silently breaks client hydration (only the WebSocket
  // HMR failure is logged).
  allowedDevOrigins: ["localhost", "127.0.0.1", "0.0.0.0"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  serverExternalPackages: [
    "lightningcss",
    "@tailwindcss/postcss",
    "@tailwindcss/node",
  ],
  // Consolidate SEO signals on the canonical host. The legacy deployment URL
  // still resolves, so send it to the current canonical host with a 308.
  redirects: async () => [
    // Legacy onboarding branch links. Intent-specific CTAs now link directly to
    // their destination; these keep old bookmarks and external links working.
    {
      source: "/onboarding",
      has: [{ type: "query", key: "path", value: "import" }],
      destination: "/builder?onboarding=import",
      permanent: false,
    },
    {
      source: "/onboarding",
      has: [{ type: "query", key: "path", value: "scratch" }],
      destination: "/onboarding/wizard",
      permanent: false,
    },
    {
      source: "/:path*",
      has: [{ type: "host", value: "careerforge-ai.vercel.app" }],
      destination: "https://safar-craft.vercel.app/:path*",
      permanent: true,
    },
  ],
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ],
};

export default nextConfig;
