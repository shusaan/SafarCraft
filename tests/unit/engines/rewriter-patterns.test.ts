import { describe, it, expect } from "vitest";
import { applyPatterns, detectWeakPatterns, REWRITER_PATTERNS } from "@/engines/rewriter/patterns";

describe("rewriter patterns", () => {
  it("rewrites 'Was responsible for' to 'Owned'", () => {
    expect(applyPatterns("Was responsible for the launch")).toBe("Owned the launch");
  });

  it("rewrites 'Worked on' to 'Engineered'", () => {
    expect(applyPatterns("Worked on the new pipeline")).toBe("Engineered the new pipeline");
  });

  it("rewrites 'Helped' to 'Drove'", () => {
    expect(applyPatterns("Helped improve release process")).toBe("Drove improve release process");
  });

  it("rewrites 'Responsible for' (no was)", () => {
    expect(applyPatterns("Responsible for payroll")).toBe("Owned payroll");
  });

  it("rewrites 'Made' to 'Built'", () => {
    expect(applyPatterns("Made a dashboard")).toBe("Built a dashboard");
  });

  it("rewrites 'Provided' to 'Delivered'", () => {
    expect(applyPatterns("Provided technical support")).toBe("Delivered technical support");
  });

  it("rewrites 'Managed' to 'Directed'", () => {
    expect(applyPatterns("Managed a team of engineers")).toBe("Directed a team of engineers");
  });

  it("capitalises the first letter of the result", () => {
    expect(applyPatterns("was in charge of everything")).toMatch(/^Led/);
  });

  it("leaves strong bullets untouched", () => {
    const strong = "Engineered a system that handles 10k req/s";
    expect(applyPatterns(strong)).toBe(strong);
  });

  it("trims whitespace before checking", () => {
    expect(applyPatterns("   Worked on X   ")).toBe("Engineered X");
  });

  it("detectWeakPatterns finds responsible for", () => {
    const matches = detectWeakPatterns("Responsible for QA");
    expect(matches.some((p) => p.name === "Responsible for")).toBe(true);
  });

  it("detectWeakPatterns returns empty for strong bullets", () => {
    expect(detectWeakPatterns("Architected a new database")).toEqual([]);
  });

  it("has at least 10 patterns loaded", () => {
    expect(REWRITER_PATTERNS.length).toBeGreaterThanOrEqual(10);
  });
});
