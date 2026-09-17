import { describe, it, expect } from "vitest";
import { buildCoverLetter } from "@/engines/rewriter/cover-letter";

describe("cover letter builder", () => {
  it("builds a 3-paragraph cover letter", () => {
    const letter = buildCoverLetter({
      jobTitle: "Senior Engineer",
      company: "Acme",
      role: "Senior Engineer",
      yearsExperience: 6,
      highlights: ["Shipped X", "Reduced p99 by 40%", "Mentored 4 juniors"],
    });
    expect(letter).toContain("Senior Engineer");
    expect(letter).toContain("Acme");
    expect(letter).toContain("6+ years");
    expect(letter).toContain("Shipped X");
    expect(letter).toContain("Best regards");
  });

  it("handles zero years", () => {
    const letter = buildCoverLetter({
      jobTitle: "Engineer",
      company: "Acme",
      yearsExperience: 0,
      highlights: [],
    });
    expect(letter).toContain("track record");
    expect(letter).not.toContain("0+ years");
  });

  it("falls back to placeholders", () => {
    const letter = buildCoverLetter({
      jobTitle: "",
      company: "",
      highlights: [],
    });
    expect(letter).toContain("[Job Title]");
    expect(letter).toContain("[Company]");
  });

  it("truncates highlights to 3", () => {
    const letter = buildCoverLetter({
      jobTitle: "Eng",
      company: "Acme",
      highlights: ["A", "B", "C", "D", "E"],
    });
    expect(letter).toContain("• A");
    expect(letter).toContain("• B");
    expect(letter).toContain("• C");
    expect(letter).not.toContain("• D");
    expect(letter).not.toContain("• E");
  });

  it("handles empty highlights gracefully", () => {
    const letter = buildCoverLetter({
      jobTitle: "Eng",
      company: "Acme",
      highlights: [],
    });
    expect(letter).not.toContain("• ");
    expect(letter).toContain("recent work");
  });
});
