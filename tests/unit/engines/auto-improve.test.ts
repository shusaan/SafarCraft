import { describe, it, expect } from "vitest";
import { buildAutoImprovements, applyAutoImprovements, isActionable } from "@/engines/rewriter/auto-improve";
import type { ResumeData } from "@/types";

const base: ResumeData = {
  personal: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    summary: "",
    photo: null,
  },
  experience: [
    {
      id: "e1",
      company: "Acme",
      position: "Engineer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "",
      current: true,
      bullets: ["Responsible for managing the payments team"],
      technologies: [],
    },
  ],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  publications: [],
};

describe("buildAutoImprovements", () => {
  it("flags weak opener phrases as actionable rewrites", () => {
    const items = buildAutoImprovements(base);
    const phrase = items.find((i) => i.kind === "phrase");

    expect(phrase).toBeDefined();
    expect(isActionable(phrase!)).toBe(true);
    expect(phrase!.original).toContain("Responsible for");
    expect(phrase!.suggested).toMatch(/^Owned /);
    expect(phrase!.expId).toBe("e1");
    expect(phrase!.bulletIndex).toBe(0);
  });

  it("flags bullets without metrics as advisory hints, not rewrites", () => {
    const data: ResumeData = {
      ...base,
      experience: [
        { ...base.experience[0]!, bullets: ["Refactored the authentication service"] },
      ],
    };
    const items = buildAutoImprovements(data);
    const metric = items.find((i) => i.kind === "metric");

    expect(metric).toBeDefined();
    expect(isActionable(metric!)).toBe(false);
    expect(metric!.suggested).toBe(metric!.original);
    expect(metric!.hint).toMatch(/metric/i);
  });

  it("does not flag bullets that already have a metric", () => {
    const data: ResumeData = {
      ...base,
      experience: [
        { ...base.experience[0]!, bullets: ["Reduced p99 latency by 40%"] },
      ],
    };
    const items = buildAutoImprovements(data);
    expect(items.filter((i) => i.kind === "metric")).toHaveLength(0);
  });

  it("flags summary style issues as advisory", () => {
    const data: ResumeData = {
      ...base,
      personal: { ...base.personal, summary: "Very passionate about basically everything" },
    };
    const items = buildAutoImprovements(data);
    const grammar = items.filter((i) => i.kind === "grammar" && i.target === "summary");

    expect(grammar.length).toBeGreaterThan(0);
    expect(grammar.every((i) => !isActionable(i))).toBe(true);
  });

  it("returns nothing for a clean resume", () => {
    const data: ResumeData = {
      ...base,
      personal: { ...base.personal, summary: "Engineer who ships measurable outcomes" },
      experience: [
        { ...base.experience[0]!, bullets: ["Reduced p99 latency by 40%"] },
      ],
    };
    expect(buildAutoImprovements(data)).toHaveLength(0);
  });
});

describe("applyAutoImprovements", () => {
  it("applies selected actionable rewrites only", () => {
    const items = buildAutoImprovements(base);
    const phrase = items.find((i) => i.kind === "phrase")!;

    const next = applyAutoImprovements(base, [phrase]);

    expect(next.experience[0]!.bullets[0]).toBe(phrase.suggested);
    // original is untouched (pure function)
    expect(base.experience[0]!.bullets[0]).toContain("Responsible for");
  });

  it("keeps the resume unchanged for advisory-only selections", () => {
    const data: ResumeData = {
      ...base,
      experience: [
        { ...base.experience[0]!, bullets: ["Refactored the authentication service"] },
      ],
    };
    const advisory = buildAutoImprovements(data).filter((i) => !isActionable(i));

    expect(applyAutoImprovements(data, advisory)).toBe(data);
  });

  it("leaves non-selected bullets untouched", () => {
    const next = applyAutoImprovements(base, []); // nothing selected

    expect(next).toBe(base);
  });
});
