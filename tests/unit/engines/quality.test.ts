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

  it("returns the five readiness axes", () => {
    const result = calculateQuality(baseData);
    expect(result.axes.length).toBe(5);
    expect(result.axes.map((a) => a.key)).toEqual(["contact", "experience", "impact", "skills", "format"]);
  });

  it("a complete resume scores high", () => {
    const result = calculateQuality(baseData);
    expect(result.overall).toBeGreaterThanOrEqual(90);
  });

  it("penalises missing name on the contact axis", () => {
    const result = calculateQuality({ ...baseData, personal: { ...baseData.personal, name: "" } });
    const contact = result.axes.find((a) => a.key === "contact")!;
    expect(contact.fixes.some((f) => f.toLowerCase().includes("full name"))).toBe(true);
    expect(contact.score).toBeLessThan(100);
  });

  it("penalises missing summary on the experience axis", () => {
    const result = calculateQuality({ ...baseData, personal: { ...baseData.personal, summary: "" } });
    const experience = result.axes.find((a) => a.key === "experience")!;
    expect(experience.fixes.some((f) => f.toLowerCase().includes("summary"))).toBe(true);
  });

  it("penalises weak verbs in the impact axis", () => {
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
    expect(impact.fixes.some((f) => f.toLowerCase().includes("action verb"))).toBe(true);
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

  it("penalises too many bullets in the format axis", () => {
    const bullets = Array.from({ length: 31 }, (_, i) => `Shipped improvement ${i} to 10 users`);
    const data = { ...baseData, experience: [{ ...baseData.experience[0]!, bullets }] };
    const result = calculateQuality(data);
    const format = result.axes.find((a) => a.key === "format")!;
    expect(format.score).toBeLessThan(100);
  });

  it("penalises missing dates on the experience axis", () => {
    const result = calculateQuality({
      ...baseData,
      experience: [{ ...baseData.experience[0]!, startDate: "", endDate: "", current: false }],
    });
    const experience = result.axes.find((a) => a.key === "experience")!;
    expect(experience.fixes.some((f) => f.toLowerCase().includes("start date"))).toBe(true);
  });

  it("penalises missing contact methods on the contact axis", () => {
    const result = calculateQuality({
      ...baseData,
      personal: { ...baseData.personal, email: "", phone: "", linkedin: "", github: "" },
    });
    const contact = result.axes.find((a) => a.key === "contact")!;
    expect(contact.fixes.length).toBeGreaterThan(0);
  });
});
