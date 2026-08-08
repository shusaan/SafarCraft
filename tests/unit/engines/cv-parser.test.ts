import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCV, parseCVFallback } from "@/engines/cv/cv-parser";
import type { ParseCVOptions } from "@/engines/cv/cv-parser";

beforeEach(() => {
  vi.restoreAllMocks();
});

const SAMPLE_RESUME = `John Doe
john@example.com
(555) 123-4567
San Francisco, CA
linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 8 years building scalable web applications.

EXPERIENCE

Senior Software Engineer
Tech Corp, San Francisco
2020-03 – Present
• Led a team of 5 engineers building a React-based dashboard
• Reduced API latency by 40% through query optimisation
• Migrated legacy monolith to microservices on AWS

Software Engineer
Startup Inc, Remote
2017-01 – 2020-02
• Built RESTful APIs with Node.js and Express
• Implemented CI/CD pipeline with GitHub Actions

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley
2013 – 2017

SKILLS
Languages: TypeScript, Python, Go
Frameworks: React, Node.js, Express
Tools: Docker, AWS, GitHub Actions`;

describe("parseCV (AI-first, fallback to regex)", () => {
  it("falls back to regex when no API key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    expect(result.parsed.name).toBe("John Doe");
    expect(result.parsed.email).toBe("john@example.com");
    expect(result.parsed.phone).toBe("(555) 123-4567");
  });

  it("passes debug context options without error", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const options: ParseCVOptions = {
      layout: "two-column",
      numPages: 2,
      quality: "high",
    };
    const result = await parseCV(SAMPLE_RESUME, options);
    expect(result.parsed.name).toBe("John Doe");
  });

  it("handles empty text gracefully", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV("");
    expect(result.parsed.name).toBe("");
    expect(result.parsed.experience).toEqual([]);
  });

  it("extracts experience entries", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    expect(result.parsed.experience.length).toBeGreaterThanOrEqual(2);
    expect(result.parsed.experience[0]?.company).toBe("Tech Corp");
    expect(result.parsed.experience[0]?.position).toBe("Senior Software Engineer");
  });

  it("extracts skill groups", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    const allSkills = result.parsed.skillGroups.flatMap((g) => g.skills);
    expect(allSkills).toContain("TypeScript");
    expect(allSkills).toContain("React");
  });

  it("extracts education", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    expect(result.parsed.education.length).toBeGreaterThanOrEqual(1);
    expect(result.parsed.education[0]?.institution).toContain("California");
  });
});

describe("parseCVFallback (pure regex)", () => {
  it("parses name from first line", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.name).toBe("John Doe");
  });

  it("parses email", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.email).toBe("john@example.com");
  });

  it("parses phone", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.phone).toBe("(555) 123-4567");
  });

  it("parses LinkedIn URL", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.linkedin).toContain("linkedin.com/in/johndoe");
  });

  it("parses location", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.location).toContain("San Francisco");
  });

  it("parses summary", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.summary).toContain("experienced software engineer");
  });

  it("returns empty result for empty input", () => {
    const result = parseCVFallback("");
    expect(result.parsed.name).toBe("");
    expect(result.parsed.experience).toEqual([]);
    expect(result.parsed.education).toEqual([]);
  });
});
