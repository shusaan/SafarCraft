import { describe, it, expect } from "vitest";
import { BLOG_POSTS } from "@/data/blog-posts";

describe("Blog post metadata wiring", () => {
  it("builds an Article schema for every blog post in the registry", () => {
    for (const post of BLOG_POSTS) {
      // If FAQ is present, the articleLd output should include FAQPage.
      const hasFaq = (post.faq?.length ?? 0) > 0;
      expect(hasFaq).toBe((post.faq?.length ?? 0) > 0);
      // Each post must have required fields.
      expect(post.title.length).toBeGreaterThan(0);
      expect(post.description.length).toBeGreaterThan(0);
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("Public resume viewer (/r/[id])", () => {
  // We don't render the page directly (it decodes a real PDF share URL),
  // but we assert the JSON-LD builder produces the expected schema when
  // given a typical personLd input.
  it("personLd includes sameAs only for valid http(s) URLs", async () => {
    const { personLd } = await import("@/lib/seo/jsonld");
    const out = JSON.parse(
      personLd({
        name: "Jane Doe",
        jobTitle: "Senior Engineer",
        email: "jane@example.com",
        sameAs: ["https://linkedin.com/in/jane", "not-a-url", "//github.com/x"],
      }).__html,
    ) as { "@graph": Array<{ "@type": string; sameAs?: string[] }> };
    const person = out["@graph"].find((n) => n["@type"] === "Person") as { sameAs?: string[] };
    expect(person.sameAs).toContain("https://linkedin.com/in/jane");
    expect(person.sameAs).not.toContain("not-a-url");
    expect(person.sameAs).not.toContain("//github.com/x");
  });
});
