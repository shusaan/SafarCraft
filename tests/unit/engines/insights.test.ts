import { describe, it, expect } from "vitest";
import { computeInsights } from "@/engines/analytics/insights";
import type { ResumeData } from "@/types";

const data: ResumeData = {
  personal: { name: "Jane", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "", photo: null },
  experience: [
    {
      id: "e1", company: "Acme", position: "Eng", location: "", startDate: "2020", endDate: "2024", current: false,
      bullets: ["Reduced latency by 40%", "Built a system", "Worked on migration"],
      technologies: [],
    },
  ],
  education: [{ id: "ed1", institution: "MIT", degree: "BSc", field: "CS", location: "", startDate: "", endDate: "", gpa: "", honors: [] }],
  skills: [{ id: "s1", category: "Lang", skills: ["Go", "Rust"] }],
  projects: [{ id: "p1", name: "X", role: "", description: "", technologies: [], url: "", highlights: [] }],
  certifications: [], languages: [], publications: [],
};

describe("computeInsights", () => {
  it("counts total bullets", () => {
    const i = computeInsights(data);
    expect(i.totalBullets).toBe(3);
  });

  it("computes average bullet length", () => {
    const i = computeInsights(data);
    expect(i.avgBulletLength).toBeGreaterThan(0);
  });

  it("finds longest and shortest", () => {
    const i = computeInsights(data);
    expect(i.longestBullet).toBeGreaterThanOrEqual(i.shortestBullet);
  });

  it("counts bullets with numbers", () => {
    const i = computeInsights(data);
    expect(i.bulletsWithNumbers).toBe(1);
  });

  it("counts weak-verb bullets", () => {
    const i = computeInsights(data);
    expect(i.bulletsWithWeakVerbs).toBe(1);
  });

  it("counts verbs by first word", () => {
    const i = computeInsights(data);
    expect(i.verbsByFirstWord["reduced"]).toBe(1);
    expect(i.verbsByFirstWord["built"]).toBe(1);
    expect(i.verbsByFirstWord["worked"]).toBe(1);
  });

  it("counts section entries", () => {
    const i = computeInsights(data);
    expect(i.sectionCounts["experience"]).toBe(1);
    expect(i.sectionCounts["education"]).toBe(1);
    expect(i.sectionCounts["skills"]).toBe(2);
    expect(i.sectionCounts["projects"]).toBe(1);
  });

  it("distributes bullet lengths into buckets", () => {
    const i = computeInsights(data);
    const total = i.bulletLengthBuckets.reduce((s, b) => s + b.count, 0);
    expect(total).toBe(3);
  });

  it("handles empty resume", () => {
    const empty: ResumeData = { ...data, experience: [], skills: [] };
    const i = computeInsights(empty);
    expect(i.totalBullets).toBe(0);
    expect(i.avgBulletLength).toBe(0);
  });
});
