/**
 * Central SEO config — single source of truth for site name, description,
 * social handles, and base URL.
 *
 * Override `NEXT_PUBLIC_SITE_URL` in production (e.g. for a custom
 * domain). Falls back to the Vercel preview URL during local dev.
 */
export const siteConfig = {
  name: "CareerForge AI",
  shortName: "CareerForge",
  tagline: "The MIT-licensed resume builder for engineers.",
  description:
    "Free, open-source ATS resume builder for software engineers. Local-first, AI-assisted when you want it, zero signup. Build, optimise and export ATS-friendly resumes in minutes.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://careerforge-ai.vercel.app",
  ogImage: "/og.png",  // static fallback; dynamic per-page OG is generated via /opengraph-image.tsx
  twitterHandle: "@careerforge", // TODO(real-handles) — placeholder
  locale: "en",
} as const;

export type SiteConfig = typeof siteConfig;
