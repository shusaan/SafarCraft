import { describe, it, expect } from "vitest";
import { buildSummary } from "@/engines/rewriter/summary-builder";

describe("summary builder", () => {
  it("builds a summary for startup target", () => {
    const s = buildSummary({
      role: "Senior Backend Engineer",
      yearsExperience: 6,
      topSkills: ["TypeScript", "PostgreSQL"],
      targetType: "startup",
    });
    expect(s).toContain("Hands-on");
    expect(s).toContain("Senior Backend Engineer");
    expect(s).toContain("6+ years");
    expect(s).toContain("TypeScript");
    expect(s).toContain("PostgreSQL");
  });

  it("builds a summary for FAANG target", () => {
    const s = buildSummary({
      role: "Staff Engineer",
      yearsExperience: 10,
      topSkills: ["Distributed systems", "Java"],
      targetType: "faang",
    });
    expect(s).toContain("Results-driven");
    expect(s).toContain("scale");
  });

  it("handles single skill", () => {
    const s = buildSummary({
      role: "Engineer",
      yearsExperience: 2,
      topSkills: ["Rust"],
      targetType: "general",
    });
    expect(s).toContain("Rust");
    expect(s).not.toContain("and Rust,");
  });

  it("handles zero skills gracefully", () => {
    const s = buildSummary({
      role: "Engineer",
      yearsExperience: 2,
      topSkills: [],
      targetType: "general",
    });
    expect(s).toContain("modern software engineering");
  });

  it("handles zero years", () => {
    const s = buildSummary({
      role: "Engineer",
      yearsExperience: 0,
      topSkills: ["Go"],
      targetType: "general",
    });
    expect(s).toContain("experience");
    expect(s).not.toContain("0+ years");
  });

  it("appends highlights when provided", () => {
    const s = buildSummary({
      role: "Engineer",
      yearsExperience: 3,
      topSkills: ["Python"],
      targetType: "startup",
      highlights: ["Shipped X to 50k users", "Reduced p99 by 40%"],
    });
    expect(s).toContain("Notable work");
    expect(s).toContain("Shipped X to 50k users");
    expect(s).toContain("Reduced p99 by 40%");
  });
});
