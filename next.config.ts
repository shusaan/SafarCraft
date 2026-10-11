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
