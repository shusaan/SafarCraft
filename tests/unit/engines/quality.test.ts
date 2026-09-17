import { describe, it, expect } from "vitest";
import { calculateQuality } from "@/engines/quality/score";
import type { ResumeData } from "@/types";

const baseData: ResumeData = {
  personal: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+1 555-0100",
    location: "SF, CA",
    linkedin: "linkedin.com/in/janedoe",
    github: "github.com/janedoe",
    website: "",
    summary: "Engineer with 8 years of experience shipping scalable systems.",
    photo: null,
  },
  experience: [
    {
      id: "e1",
      company: "Acme",
      position: "Senior Engineer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "2024-03",
      current: false,
      bullets: [
        "Reduced p99 latency by 40% by profiling the hot path in the auth service",
        "Shipped feature X used by 50k users across 12 teams",
        "Mentored 4 junior engineers through code reviews and pair sessions",
      ],
      technologies: ["TypeScript", "PostgreSQL"],
    },
  ],
  education: [{ id: "ed1", institution: "MIT", degree: "BSc", field: "CS", location: "", startDate: "2014", endDate: "2018", gpa: "", honors: [] }],
  skills: [
    { id: "s1", category: "Languages", skills: ["TypeScript", "Python", "Go"] },
    { id: "s2", category: "Cloud", skills: ["AWS", "Kubernetes"] },
  ],
  projects: [],
  certifications: [],
  languages: [],
  publications: [],
};

describe("calculateQuality", () => {
  it("returns overall in 0-100", () => {
    const result = calculateQuality(baseData);
    expect(result.overall).toBeGreaterThanOrEqual(0);
    expect(result.overall).toBeLessThanOrEqual(100);
  });

  it("returns 5 axes", () => {
    const result = calculateQuality(baseData);
    expect(result.axes.length).toBe(5);
    expect(result.axes.map((a) => a.key)).toEqual(["content", "format", "ats", "brevity", "impact"]);
  });

  it("a complete resume scores high", () => {
    const result = calculateQuality(baseData);
    expect(result.overall).toBeGreaterThanOrEqual(80);
  });

  it("penalises missing name", () => {
    const result = calculateQuality({ ...baseData, personal: { ...baseData.personal, name: "" } });
    const content = result.axes.find((a) => a.key === "content")!;
    expect(content.fixes).toContain("Add your name");
    expect(content.score).toBeLessThan(100);
  });

  it("penalises missing summary", () => {
    const result = calculateQuality({ ...baseData, personal: { ...baseData.personal, summary: "" } });
    const content = result.axes.find((a) => a.key === "content")!;
    expect(content.fixes.some((f) => f.toLowerCase().includes("summary"))).toBe(true);
  });

  it("penalises weak verbs in impact axis", () => {
    const result = calculateQuality({
      ...baseData,
      experience: [
        {
          ...baseData.experience[0]!,
          bullets: ["Was responsible for the launch", "Helped improve performance"],
        },
      ],
    });
    const impact = result.axes.find((a) => a.key === "impact")!;
    expect(impact.fixes.some((f) => f.includes("weak verb"))).toBe(true);
  });

  it("rewards quantified bullets", () => {
    const withMetrics = calculateQuality(baseData);
    const noMetrics = calculateQuality({
      ...baseData,
      experience: [{ ...baseData.experience[0]!, bullets: ["Worked on system", "Did other thing", "Was part of team"] }],
    });
    const a = withMetrics.axes.find((x) => x.key === "impact")!.score;
    const b = noMetrics.axes.find((x) => x.key === "impact")!.score;
    expect(a).toBeGreaterThan(b);
  });

  it("penalises too many bullets in brevity", () => {
    const many = Array.from({ length: 30 }, (_, i) => `Bullet ${i}`).join("\n");
    const data = { ...baseData, experience: [{ ...baseData.experience[0]!, bullets: many.split("\n") }] };
    const result = calculateQuality(data);
    const brevity = result.axes.find((a) => a.key === "brevity")!;
    expect(brevity.score).toBeLessThan(100);
  });

  it("penalises missing dates in format", () => {
    const result = calculateQuality({
      ...baseData,
      experience: [{ ...baseData.experience[0]!, startDate: "", endDate: "", current: false }],
    });
    const format = result.axes.find((a) => a.key === "format")!;
    expect(format.fixes.some((f) => f.toLowerCase().includes("dates"))).toBe(true);
  });

  it("penalises missing contact methods in ATS", () => {
    const result = calculateQuality({
      ...baseData,
      personal: { ...baseData.personal, email: "", phone: "", linkedin: "", github: "" },
    });
    const ats = result.axes.find((a) => a.key === "ats")!;
    expect(ats.fixes.length).toBeGreaterThan(0);
  });
});