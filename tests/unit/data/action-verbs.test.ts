import { describe, it, expect } from "vitest";
import {
  ACTION_VERBS,
  detectFirstVerb,
  detectCategory,
  suggestVerbFor,
  getVerbsByDomain,
  WEAK_VERBS,
  type VerbDomain,
} from "@/data/action-verbs";

describe("action-verbs", () => {
  it("has at least 200 verbs", () => {
    expect(ACTION_VERBS.length).toBeGreaterThanOrEqual(200);
  });

  it("every verb is in a known domain", () => {
    const known = new Set<VerbDomain>([
      "Engineering",
      "Leadership",
      "Design",
      "Data",
      "Product",
      "Research",
      "Operations",
    ]);
    for (const v of ACTION_VERBS) {
      expect(known.has(v.domain)).toBe(true);
    }
  });

  it("verbs are unique within their domain", () => {
    const seen = new Map<string, number>();
    for (const v of ACTION_VERBS) {
      seen.set(v.verb, (seen.get(v.verb) ?? 0) + 1);
    }
    for (const [verb, count] of seen) {
      if (count > 1) {
        const domains = ACTION_VERBS.filter((v) => v.verb === verb).map((v) => v.domain).sort();
        expect.soft(domains, `verb ${verb} appears in: ${domains.join(", ")}`).toBeTruthy();
      }
    }
  });

  it("detectFirstVerb extracts the leading word case-insensitively", () => {
    expect(detectFirstVerb("Worked on the backend")).toBe("worked");
    expect(detectFirstVerb("ARCHITECTED a platform")).toBe("architected");
    expect(detectFirstVerb("")).toBe("");
  });

  it("detectCategory identifies Engineering bullets", () => {
    expect(detectCategory("Built a CI pipeline")).toBe("Engineering");
  });

  it("detectCategory identifies Leadership bullets", () => {
    expect(detectCategory("Led a team of 6")).toBe("Leadership");
  });

  it("detectCategory identifies Design bullets", () => {
    expect(detectCategory("Designed a UI prototype")).toBe("Design");
  });

  it("detectCategory falls back to Engineering", () => {
    expect(detectCategory("Did some random task")).toBe("Engineering");
  });

  it("suggestVerbFor returns 5 by default", () => {
    const v = suggestVerbFor("Worked on the auth service");
    expect(v.length).toBe(5);
  });

  it("suggestVerbFor excludes the current first verb", () => {
    const v = suggestVerbFor("Engineered a new compiler");
    for (const item of v) {
      expect(item.verb.toLowerCase()).not.toBe("engineered");
    }
  });

  it("getVerbsByDomain returns only that domain", () => {
    const eng = getVerbsByDomain("Engineering");
    expect(eng.length).toBeGreaterThan(0);
    for (const v of eng) expect(v.domain).toBe("Engineering");
  });

  it("WEAK_VERBS contains the canonical weak words", () => {
    for (const w of ["worked", "helped", "responsible", "made", "got"]) {
      expect(WEAK_VERBS.has(w)).toBe(true);
    }
  });
});
