import { describe, it, expect } from "vitest";
import { calculateATSScore } from "@/engines/ats/ats-engine";
import { analyzeJobDescription } from "@/engines/ats/jd-analyzer";
import { compareResumes } from "@/engines/ats/comparison";
import { defaultResumeData, type ResumeData } from "@/types";

describe("ATS Engine", () => {
  it("returns 0 score for empty resume", () => {
    const result = calculateATSScore(defaultResumeData);
    expect(result.score).toBeLessThan(50);
    expect(result.deductions.length).toBeGreaterThan(0);
  });

  it("returns higher score for complete resume", () => {
    const data: ResumeData = {
      ...defaultResumeData,
      personal: {
        ...defaultResumeData.personal,
        name: "John Doe",
        email: "john@example.com",
        summary: "Experienced engineer",
      },
      experience: [
        {
          id: "1",
          company: "Tech Co",
          position: "Senior Engineer",
          location: "Remote",
          startDate: "2020",
          endDate: "2024",
          current: false,
          bullets: ["Led team of 5 engineers", "Reduced latency by 40%"],
          technologies: ["React", "Node"],
        },
      ],
      skills: [{ id: "1", category: "Languages", skills: ["TypeScript", "Python"] }],
    };
    const result = calculateATSScore(data);
    expect(result.score).toBeGreaterThan(50);
  });

  it("detects weak verbs", () => {
    const data: ResumeData = {
      ...defaultResumeData,
      personal: { ...defaultResumeData.personal, name: "Test", email: "t@t.com" },
      experience: [{
        id: "1", company: "C", position: "E", location: "", startDate: "", endDate: "",
        current: false, bullets: ["Was responsible for things"], technologies: [],
      }],
    };
    const result = calculateATSScore(data);
    expect(result.deductions.some((d) => d.category === "Weak Verbs")).toBe(true);
  });

  it("groups repeated no-metrics findings into a single capped deduction", () => {
    const data: ResumeData = {
      ...defaultResumeData,
      personal: { ...defaultResumeData.personal, name: "Test", email: "t@t.com", summary: "x".repeat(60) },
      experience: [{
        id: "1", company: "C", position: "E", location: "", startDate: "2020", endDate: "2021",
        current: false,
        bullets: Array.from({ length: 35 }, () => "Owned the migration of the billing module end to end without any numbers"),
        technologies: [],
      }],
      skills: [{ id: "1", category: "Languages", skills: ["TypeScript"] }],
    };

    const result = calculateATSScore(data);

    const noMetrics = result.deductions.filter((d) => d.category === "No Metrics");
    expect(noMetrics).toHaveLength(1);
    expect(noMetrics[0]!.reason).toContain("35 of 35 bullets");
    expect(noMetrics[0]!.points).toBeLessThanOrEqual(20);
    // The score is not tanked by repetition: one capped deduction beats 35.
    expect(result.score).toBeGreaterThan(30);
  });

  it("does not emit no-metrics for bullets that contain numbers", () => {
    const data: ResumeData = {
      ...defaultResumeData,
      personal: { ...defaultResumeData.personal, name: "Test", email: "t@t.com", summary: "x".repeat(60) },
      experience: [{
        id: "1", company: "C", position: "E", location: "", startDate: "2020", endDate: "2021",
        current: false,
        bullets: ["Reduced latency by 40%", "Shipped to 50k users"],
        technologies: [],
      }],
      skills: [{ id: "1", category: "Languages", skills: ["TypeScript"] }],
    };
    const result = calculateATSScore(data);
    expect(result.deductions.filter((d) => d.category === "No Metrics")).toHaveLength(0);
  });
});

describe("JD Analyzer", () => {
  it("extracts skills from job description", () => {
    const jd = "We are looking for a Senior React developer with TypeScript and Node.js experience";
    const result = analyzeJobDescription(jd, defaultResumeData);
    expect(result.jdSkills.length).toBeGreaterThan(0);
    expect(result.jdSkills).toContain("react");
    expect(result.experienceLevel).toBe("senior");
  });

  it("detects missing skills", () => {
    const jd = "Looking for Kubernetes, Docker, AWS expertise";
    const result = analyzeJobDescription(jd, defaultResumeData);
    expect(result.missingSkills.length).toBeGreaterThan(0);
  });
});

describe("ATS job match", () => {
  const targetedData: ResumeData = {
    ...defaultResumeData,
    personal: {
      ...defaultResumeData.personal,
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      phone: "+92 300 1234567",
      location: "Karachi",
      linkedin: "linkedin.com/in/ayesha",
      summary: "Frontend engineer with 6 years of experience building React and TypeScript products.",
    },
    experience: [{
      id: "1",
      company: "Careem",
      position: "Senior Frontend Engineer",
      location: "Remote",
      startDate: "2022-01",
      endDate: "",
      current: true,
      bullets: [
        "Built a design system used by 5 product teams and 40+ engineers",
        "Reduced page load time by 42% with React and TypeScript",
      ],
      technologies: ["React", "TypeScript", "PostgreSQL"],
    }],
    education: [{
      id: "e1", institution: "NUST", degree: "BS", field: "Computer Science",
      location: "", startDate: "2014", endDate: "2018", gpa: "", honors: [],
    }],
    skills: [
      { id: "s1", category: "Frontend", skills: ["React", "TypeScript"] },
      { id: "s2", category: "Data", skills: ["PostgreSQL"] },
    ],
  };

  const jd = `Requirements:
- 3+ years of experience with React and TypeScript
- Strong PostgreSQL and AWS experience

Nice to have:
- Kubernetes
- GraphQL`;

  it("returns no job match without a description", () => {
    const result = calculateATSScore(targetedData);
    expect(result.jobMatch).toBeNull();
    expect(result.score).toBe(result.readinessScore);
  });

  it("splits required and preferred keywords", () => {
    const result = calculateATSScore(targetedData, jd);
    expect(result.jobMatch).not.toBeNull();
    expect(result.jobMatch!.requiredKeywords).toEqual(
      expect.arrayContaining(["react", "typescript", "postgresql", "aws"]),
    );
    expect(result.jobMatch!.preferredKeywords).toEqual(
      expect.arrayContaining(["kubernetes", "graphql"]),
    );
  });

  it("reports missing required keywords", () => {
    const result = calculateATSScore(targetedData, jd);
    expect(result.jobMatch!.missingKeywords).toContain("aws");
    expect(result.jobMatch!.missingKeywords).toContain("kubernetes");
    expect(result.jobMatch!.evidence.some((e) => e.keyword === "react" && e.found)).toBe(true);
    expect(result.jobMatch!.evidence.some((e) => e.keyword === "aws" && !e.found)).toBe(true);
  });

  it("weights the overall score as 50% readiness and 50% job match", () => {
    const result = calculateATSScore(targetedData, jd);
    expect(result.score).toBe(
      Math.round(result.readinessScore * 0.5 + result.jobMatch!.score * 0.5),
    );
  });

  it("scores a stronger keyword match higher", () => {
    const weak = calculateATSScore(
      {
        ...targetedData,
        experience: targetedData.experience.map((entry) => ({ ...entry, technologies: [], bullets: ["Built things"] })),
        skills: [{ id: "s1", category: "Frontend", skills: ["React"] }],
      },
      jd,
    );
    const strong = calculateATSScore(targetedData, jd);
    expect(strong.jobMatch!.score).toBeGreaterThan(weak.jobMatch!.score);
  });

  it("extracts keywords from inline heading lines", () => {
    const inlineJd = `Skills: React, TypeScript
Preferred qualifications: Kubernetes, GraphQL`;
    const result = calculateATSScore(targetedData, inlineJd);

    expect(result.jobMatch).not.toBeNull();
    expect(result.jobMatch!.requiredKeywords).toEqual(expect.arrayContaining(["react", "typescript"]));
    expect(result.jobMatch!.preferredKeywords).toEqual(expect.arrayContaining(["kubernetes", "graphql"]));
  });

  it("does not treat a mid-sentence mention of skills as a new heading", () => {
    const inlineJd = `We value strong communication skills.
React and TypeScript are used daily.`;
    const result = calculateATSScore(targetedData, inlineJd);

    expect(result.jobMatch).not.toBeNull();
    expect(result.jobMatch!.requiredKeywords).toEqual(expect.arrayContaining(["react", "typescript"]));
  });

  it("returns no job match when the JD has no recognizable keywords", () => {
    const result = calculateATSScore(targetedData, "We are a friendly team that values curiosity.");
    expect(result.jobMatch).toBeNull();
  });
});

describe("Resume Comparison", () => {
  it("detects added skills", () => {
    const oldData = { ...defaultResumeData, skills: [{ id: "1", category: "Lang", skills: ["Python"] }] };
    const newData = { ...defaultResumeData, skills: [{ id: "1", category: "Lang", skills: ["Python", "Rust"] }] };
    const changes = compareResumes(oldData, newData);
    expect(changes.length).toBeGreaterThan(0);
  });
});
