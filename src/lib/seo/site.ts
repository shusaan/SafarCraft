/**
 * Central SEO config — single source of truth for site name, description,
 * social handles, and base URL.
 *
 * Override `NEXT_PUBLIC_SITE_URL` when a custom domain is attached. Until then
 * `safar-craft.vercel.app` is the canonical host; the legacy
 * `careerforge-ai.vercel.app` host permanently redirects to it (see
 * `next.config.ts`). When a custom domain goes live, set the env var and the
 * canonical, Open Graph, JSON-LD, robots and sitemap all follow automatically.
 */
export const siteConfig = {
  name: "SafarCraft",
  shortName: "SafarCraft",
  tagline: "A free, private CV and resume builder for your next step.",
  description:
    "SafarCraft is a free, open-source CV and resume builder. Create and edit a CV in your browser, review practical ATS guidance, and export PDF, DOCX, or JSON Resume without creating an account.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://safar-craft.vercel.app",
  ogImage: "/opengraph-image",
  twitterHandle: "",
  locale: "en",
} as const;

export type SiteConfig = typeof siteConfig;
