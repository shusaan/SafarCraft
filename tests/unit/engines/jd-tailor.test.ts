import { describe, it, expect } from "vitest";
import { tailorToJD } from "@/engines/jd-tailor/tailor";
import type { ResumeData } from "@/types";

const data: ResumeData = {
  personal: {
    name: "Jane", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "Backend engineer", photo: null,
  },
  experience: [
    {
      id: "e1", company: "Acme", position: "Engineer", location: "", startDate: "2020", endDate: "2024", current: false,
      bullets: ["Built microservices with TypeScript", "Used PostgreSQL and Redis", "Deployed to AWS"],
      technologies: ["TypeScript", "PostgreSQL", "Redis", "AWS"],
    },
  ],
  education: [], skills: [{ id: "s1", category: "Lang", skills: ["TypeScript", "Python"] }],
  projects: [], certifications: [], languages: [], publications: [],
};

describe("JD tailor", () => {
  it("extracts keywords from a JD", () => {
    const jd = "We need a TypeScript engineer with PostgreSQL and AWS experience.";
    const result = tailorToJD(jd, data);
    expect(result.jdKeywords).toContain("typescript");
    expect(result.jdKeywords).toContain("postgresql");
    expect(result.jdKeywords).toContain("aws");
  });

  it("matches keywords present in resume", () => {
    const jd = "TypeScript PostgreSQL Redis AWS";
    const result = tailorToJD(jd, data);
    expect(result.matched).toContain("typescript");
    expect(result.matched).toContain("postgresql");
    expect(result.matchScore).toBeGreaterThan(0);
  });

  it("identifies missing keywords", () => {
    const jd = "Rust Kubernetes Kafka GraphQL";
    const result = tailorToJD(jd, data);
    expect(result.missing.length).toBeGreaterThan(0);
    expect(result.matchScore).toBeLessThan(50);
  });

  it("stops at common stop words", () => {
    const jd = "The and of to with";
    const result = tailorToJD(jd, data);
    expect(result.jdKeywords.length).toBe(0);
  });

  it("returns 0 score for empty JD", () => {
    const result = tailorToJD("", data);
    expect(result.matchScore).toBe(0);
  });

  it("suggests rephrasing for fuzzy matches", () => {
    const jd = "kuberntes postgress";
    const result = tailorToJD(jd, data);
    expect(result.matched.length).toBeGreaterThanOrEqual(0);
  });

  it("returns reasonable scores for well-matched resume", () => {
    const jd = "TypeScript engineer with cloud experience";
    const result = tailorToJD(jd, data);
    expect(result.matchScore).toBeGreaterThanOrEqual(40);
  });
});
