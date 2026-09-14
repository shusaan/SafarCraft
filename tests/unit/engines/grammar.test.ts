import { describe, it, expect } from "vitest";
import { checkGrammar } from "@/engines/grammar/checker";

describe("grammar checker", () => {
  it("flags weasel words", () => {
    const issues = checkGrammar("I was very happy");
    expect(issues.some((i) => i.kind === "weasel" && i.snippet.toLowerCase() === "very")).toBe(true);
  });

  it("flags clichés", () => {
    const issues = checkGrammar("We need to think outside the box");
    expect(issues.some((i) => i.kind === "cliche")).toBe(true);
  });

  it("flags weak phrases", () => {
    const issues = checkGrammar("I did this in order to learn");
    expect(issues.some((i) => i.kind === "weak-phrase")).toBe(true);
  });

  it("flags doubled words", () => {
    const issues = checkGrammar("I did did the work");
    expect(issues.some((i) => i.kind === "doubled")).toBe(true);
  });

  it("flags passive voice heuristically", () => {
    const issues = checkGrammar("The code was reviewed by John");
    expect(issues.some((i) => i.kind === "passive")).toBe(true);
  });

  it("returns no issues for a clean sentence", () => {
    const issues = checkGrammar("I shipped the project in March.");
    const blocked = issues.filter((i) => i.kind !== "passive");
    expect(blocked).toEqual([]);
  });

  it("returns issues sorted by position", () => {
    const text = "very good and basically great";
    const issues = checkGrammar(text);
    for (let i = 1; i < issues.length; i++) {
      expect(issues[i]!.start).toBeGreaterThanOrEqual(issues[i - 1]!.start);
    }
  });

  it("handles empty input", () => {
    expect(checkGrammar("")).toEqual([]);
  });
});
