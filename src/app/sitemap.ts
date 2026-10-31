import type { MetadataRoute } from "next";
import { ALTERNATIVES } from "@/data/alternatives";
import { BLOG_POSTS } from "@/data/blog-posts";
import { siteConfig } from "@/lib/seo/site";

// Generated once at build time. Avoid `new Date()` per request so the
// `lastModified` value reflects an actual content change rather than every
// crawler hit.
const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/free-cv-maker`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/cv-templates`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ats-cv-checker`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/builder`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/onboarding`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/alternatives`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = BLOG_POSTS.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const alternativeEntries: MetadataRoute.Sitemap = ALTERNATIVES.map((item) => ({
    url: `${baseUrl}/alternatives/${item.slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticEntries, ...blogEntries, ...alternativeEntries];
}
