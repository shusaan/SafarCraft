/**
 * JSON-LD schema.org builders. Return React elements ready to drop into
 * a layout (`<script type="application/ld+json" dangerouslySetInnerHTML={...} />`).
 *
 * All builders return schema.org-compatible JSON with @context.
 */
import { siteConfig } from "./site";

// ─── Helpers ──────────────────────────────────────────────────────────────

function jsonScript<T>(payload: T): {
  __html: string;
} {
  return {
    __html: JSON.stringify(payload),
  };
}

function absUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${siteConfig.url}${path.startsWith("/") ? "" : "/"}${path}`;
}

// ─── Builders ─────────────────────────────────────────────────────────────

interface OrganizationOptions {
  /** SameAs social profiles (LinkedIn, GitHub, etc.) */
  sameAs?: string[];
}

/** Organization + WebApplication + BreadcrumbList for the home page. */
export function organizationLd(opts: OrganizationOptions = {}): {
  __html: string;
} {
  const org = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon-512.png`,
        description: siteConfig.description,
        sameAs: opts.sameAs ?? [],
      },
      {
        "@type": "WebApplication",
        "@id": `${siteConfig.url}/#webapp`,
        name: siteConfig.name,
        url: siteConfig.url,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any (web-based)",
        description: siteConfig.description,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          // InStock while we're free-only; switch to PreOrder when Tier 2 lands.
          availability: "https://schema.org/InStock",
        },
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteConfig.url,
          },
        ],
      },
    ],
  };

  return jsonScript(org);
}

interface ArticleOptions {
  title: string;
  description: string;
  path: string;            // e.g. "/blog/ats-friendly-resume-format-2026"
  datePublished: string;   // ISO
  dateModified?: string;    // ISO
  authorName?: string;
  image?: string;
  faq?: Array<{ q: string; a: string }>;
}

/**
 * Article (with optional FAQPage) for blog posts.
 * Includes BreadcrumbList with Home → Blog → Post trail.
 */
export function articleLd(opts: ArticleOptions): { __html: string } {
  const url = absUrl(opts.path);

  const graph: any[] = [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      url,
      headline: opts.title,
      description: opts.description,
      image: opts.image ? absUrl(opts.image) : `${siteConfig.url}${siteConfig.ogImage}`,
      datePublished: opts.datePublished,
      dateModified: opts.dateModified ?? opts.datePublished,
      author: {
        "@type": "Organization",
        name: opts.authorName ?? siteConfig.name,
      },
      publisher: { "@id": `${siteConfig.url}/#organization` },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${siteConfig.url}/blog` },
        { "@type": "ListItem", position: 3, name: opts.title, item: url },
      ],
    },
  ];

  if (opts.faq && opts.faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: opts.faq.map((qa) => ({
        "@type": "Question",
        name: qa.q,
        acceptedAnswer: { "@type": "Answer", text: qa.a },
      })),
    });
  }

  return jsonScript({ "@context": "https://schema.org", "@graph": graph });
}

interface PersonOptions {
  name: string;
  jobTitle: string;
  email: string;
  phone?: string;
  address?: string;
  sameAs?: string[];
  url?: string;
  publicResumePath?: string; // e.g. "/r/abc123"
}

/**
 * Person + BreadcrumbList + WebSite for public resume viewer pages.
 * The Person node is what AI crawlers (and recruiters using structured
 * data tools) can pick up directly.
 */
export function personLd(opts: PersonOptions): { __html: string } {
  const url = opts.url ?? (opts.publicResumePath ? absUrl(opts.publicResumePath) : siteConfig.url);

  const graph: any[] = [
    {
      "@type": "Person",
      "@id": url,
      name: opts.name,
      jobTitle: opts.jobTitle,
      email: opts.email,
      url,
      ...(opts.phone && { telephone: opts.phone }),
      ...(opts.address && { homeLocation: { "@type": "Place", name: opts.address } }),
      ...(opts.sameAs && { sameAs: opts.sameAs }),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Public resume", item: url },
      ],
    },
  ];

  return jsonScript({ "@context": "https://schema.org", "@graph": graph });
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

/** Simple standalone BreadcrumbList for any page. */
export function breadcrumbLd(items: BreadcrumbItem[]): { __html: string } {
  return jsonScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  });
}
