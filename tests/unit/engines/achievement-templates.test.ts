import { describe, it, expect } from "vitest";
import { ACHIEVEMENT_TEMPLATES, pickTopAchievements } from "@/engines/rewriter/achievement-templates";

describe("achievement templates", () => {
  it("has templates for every supported role", () => {
    const roles = ["engineering", "leadership", "product", "design", "data", "research", "operations"] as const;
    for (const role of roles) {
      expect(ACHIEVEMENT_TEMPLATES[role].length).toBeGreaterThan(0);
    }
  });

  it("engineering has 10+ templates", () => {
    expect(ACHIEVEMENT_TEMPLATES.engineering.length).toBeGreaterThanOrEqual(10);
  });

  it("leadership has 10+ templates", () => {
    expect(ACHIEVEMENT_TEMPLATES.leadership.length).toBeGreaterThanOrEqual(10);
  });

  it("total templates >= 60", () => {
    const total = Object.values(ACHIEVEMENT_TEMPLATES).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBeGreaterThanOrEqual(60);
  });

  it("pickTopAchievements returns N unique items", () => {
    const picks = pickTopAchievements("engineering", 3);
    expect(picks.length).toBe(3);
    expect(new Set(picks).size).toBe(3);
  });

  it("pickTopAchievements falls back to engineering for unknown role", () => {
    const picks = pickTopAchievements("nonexistent" as never, 2);
    expect(picks.length).toBe(2);
  });
});
