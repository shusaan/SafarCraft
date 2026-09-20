import type { Metadata } from "next";
import { siteConfig } from "./site";

/**
 * Single source of truth for `<title>`, `<meta description>`, OG, Twitter.
 *
 * Use `buildMetadata({ title, description, path, image, type })` per route
 * so titles, descriptions, canonicals and OG are consistent everywhere.
 */
interface BuildMetadataOptions {
  title: string;
  description?: string;
  path?: string;                   // e.g. "/builder"
  image?: string;                  // absolute or site-relative
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function buildMetadata({
  title,
  description = siteConfig.description,
  path,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex,
}: BuildMetadataOptions): Metadata {
  const url = path ? `${siteConfig.url}${path}` : siteConfig.url;
  const img = image
    ? (image.startsWith("http") ? image : `${siteConfig.url}${image}`)
    : `${siteConfig.url}${siteConfig.ogImage}`;

  return {
    title,
    description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: siteConfig.name,
      title,
      description,
      url,
      images: [
      { url: img, width: 1200, height: 630, alt: title },
      // Per Next.js conventions, also include the /opengraph-image route so
      // social platforms can dynamically generate previews from any route.
      { url: `${siteConfig.url}/opengraph-image`, width: 1200, height: 630, alt: title },
    ],
      locale: siteConfig.locale,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitterHandle,
      creator: siteConfig.twitterHandle,
      title,
      description,
      images: [img, `${siteConfig.url}/opengraph-image`],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  };
}

/**
 * Default OG/Twitter metadata used by `generateMetadata` calls that
 * only override the title (the rest comes from here).
 */
export const defaultOpenGraph = {
  type: "website" as const,
  siteName: siteConfig.name,
  locale: siteConfig.locale,
  images: [{ url: `${siteConfig.url}${siteConfig.ogImage}`, width: 1200, height: 630, alt: siteConfig.name }],
};
