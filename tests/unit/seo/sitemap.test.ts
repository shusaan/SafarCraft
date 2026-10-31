import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/lib/seo/site";
import { ALTERNATIVES } from "@/data/alternatives";
import { BLOG_POSTS } from "@/data/blog-posts";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it("uses the canonical site URL for every entry", () => {
    for (const url of urls) {
      expect(url.startsWith(siteConfig.url)).toBe(true);
    }
  });

  it("includes the core CV landing pages", () => {
    for (const path of [
      "/free-cv-maker",
      "/cv-templates",
      "/templates",
      "/ats-cv-checker",
      "/builder",
      "/onboarding",
    ]) {
      expect(urls).toContain(`${siteConfig.url}${path}`);
    }
  });

  it("includes every blog post and alternative page", () => {
    for (const post of BLOG_POSTS) {
      expect(urls).toContain(`${siteConfig.url}/blog/${post.slug}`);
    }
    for (const alternative of ALTERNATIVES) {
      expect(urls).toContain(`${siteConfig.url}/alternatives/${alternative.slug}`);
    }
  });

  it("does not expose auth or API routes", () => {
    expect(urls.some((url) => url.includes("/login"))).toBe(false);
    expect(urls.some((url) => url.includes("/register"))).toBe(false);
    expect(urls.some((url) => url.includes("/api/"))).toBe(false);
  });
});
