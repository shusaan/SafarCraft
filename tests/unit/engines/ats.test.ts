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
});

describe("JD Analyzer", () => {
  it("extracts skills from job description", () => {
    const jd = "We are looking for a Senior React developer with TypeScript and Node.js experience";
    const result = analyzeJobDescription(jd, defaultResumeData);
    expect(result.skills.length).toBeGreaterThan(0);
    expect(result.skills).toContain("react");
    expect(result.experienceLevel).toBe("senior");
  });

  it("detects missing skills", () => {
    const jd = "Looking for Kubernetes, Docker, AWS expertise";
    const result = analyzeJobDescription(jd, defaultResumeData);
    expect(result.missingSkills.length).toBeGreaterThan(0);
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
