/**
 * Central SEO config — single source of truth for site name, description,
 * social handles, and base URL.
 *
 * Override `NEXT_PUBLIC_SITE_URL` after the SafarCraft domain is configured.
 * Keep the existing deployed URL as a fallback until the new domain is live.
 */
export const siteConfig = {
  name: "SafarCraft",
  shortName: "SafarCraft",
  tagline: "A free, private resume builder for your next step.",
  description:
    "SafarCraft is a free, open-source resume and CV builder. Create and edit resumes in your browser, review practical ATS guidance, and export PDF, DOCX, or JSON Resume without creating an account.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://careerforge-ai.vercel.app",
  ogImage: "/opengraph-image",
  twitterHandle: "",
  locale: "en",
} as const;

export type SiteConfig = typeof siteConfig;
