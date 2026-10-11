import { describe, it, expect } from "vitest";
import { siteConfig } from "@/lib/seo/site";
import { buildMetadata } from "@/lib/seo/metadata";
import {
  organizationLd,
  articleLd,
  personLd,
  breadcrumbLd,
} from "@/lib/seo/jsonld";

describe("siteConfig", () => {
  it("has a stable URL and name", () => {
    expect(siteConfig.name.length).toBeGreaterThan(0);
    expect(siteConfig.url).toMatch(/^https?:\/\//);
  });
});

describe("buildMetadata", () => {
  it("returns canonical, OG, Twitter and robots", () => {
    const meta = buildMetadata({
      title: "Test Page",
      description: "A test description.",
      path: "/test",
    });
    expect(meta.title).toBe("Test Page");
    expect(meta.description).toBe("A test description.");
    expect(meta.alternates?.canonical).toBe(`${siteConfig.url}/test`);
    const og = Array.isArray(meta.openGraph) ? meta.openGraph[0] : meta.openGraph;
    const tw = Array.isArray(meta.twitter) ? meta.twitter[0] : meta.twitter;
    expect(og?.title).toBe("Test Page");
    expect(og?.siteName).toBe(siteConfig.name);
    expect(tw?.card).toBe("summary_large_image");
    expect(meta.robots).toBeDefined();
  });

  it("honors noIndex", () => {
    const meta = buildMetadata({ title: "Private", noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("accepts article type + dates", () => {
    const meta = buildMetadata({
      title: "Article",
      path: "/blog/x",
      type: "article",
      publishedTime: "2026-01-01T00:00:00Z",
    });
    const og = Array.isArray(meta.openGraph) ? meta.openGraph[0] : meta.openGraph;
    expect(og?.type).toBe("article");
    expect((og as { publishedTime?: string })?.publishedTime).toBe("2026-01-01T00:00:00Z");
  });
});

describe("JSON-LD builders", () => {
  function asJson(html: { __html: string }): unknown {
    return JSON.parse(html.__html);
  }

  it("organizationLd emits Organization + WebApplication + BreadcrumbList", () => {
    const json = asJson(organizationLd({ sameAs: ["https://github.com/test"] }));
    const graph = (json as { "@graph": unknown[] })["@graph"];
    expect(graph.length).toBeGreaterThanOrEqual(3);
    const types = graph.map((n) => (n as { "@type": string })["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebApplication");
    expect(types).toContain("BreadcrumbList");
    const org = graph.find((n) => (n as { "@type": string })["@type"] === "Organization") as { sameAs?: string[] };
    expect(org.sameAs).toContain("https://github.com/test");
  });

  it("articleLd emits Article + BreadcrumbList (and FAQPage when FAQ present)", () => {
    const a = articleLd({
      title: "ATS tips",
      description: "How to pass ATS",
      path: "/blog/ats",
      datePublished: "2026-01-01",
      faq: [{ q: "Q?", a: "A." }],
    });
    const json = asJson(a) as { "@graph": Array<{ "@type": string }> };
    const types = json["@graph"].map((n) => n["@type"]);
    expect(types).toContain("Article");
    expect(types).toContain("BreadcrumbList");
    expect(types).toContain("FAQPage");
  });

  it("articleLd omits FAQPage when no FAQ", () => {
    const a = articleLd({
      title: "x",
      description: "y",
      path: "/blog/x",
      datePublished: "2026-01-01",
    });
    const types = (asJson(a) as { "@graph": Array<{ "@type": string }> })["@graph"].map((n) => n["@type"]);
    expect(types).not.toContain("FAQPage");
  });

  it("personLd emits Person + WebSite + BreadcrumbList", () => {
    const json = asJson(
      personLd({
        name: "Jane Doe",
        jobTitle: "Senior Engineer",
        email: "jane@example.com",
        sameAs: ["https://linkedin.com/in/jane"],
      }),
    ) as { "@graph": Array<{ "@type": string }> };
    const types = json["@graph"].map((n) => n["@type"]);
    expect(types).toContain("Person");
    expect(types).toContain("WebSite");
    expect(types).toContain("BreadcrumbList");
  });

  it("breadcrumbLd builds positions 1..N", () => {
    const json = asJson(
      breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: "Post", path: "/blog/x" },
      ]),
    ) as { itemListElement: Array<{ position: number }> };
    expect(json.itemListElement.map((i) => i.position)).toEqual([1, 2, 3]);
  });
});
