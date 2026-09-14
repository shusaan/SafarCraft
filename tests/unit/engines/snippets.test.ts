import { describe, it, expect, beforeEach } from "vitest";
import { addSnippet, deleteSnippet, loadSnippets } from "@/engines/snippets/library";

beforeEach(() => {
  if (typeof localStorage !== "undefined") localStorage.clear();
});

describe("snippet library", () => {
  it("returns empty when storage is empty", () => {
    expect(loadSnippets()).toEqual([]);
  });

  it("adds a snippet", () => {
    const s = addSnippet("Mentoring", "Mentored 4 junior engineers");
    expect(s.label).toBe("Mentoring");
    expect(s.text).toBe("Mentored 4 junior engineers");
    expect(s.id).toBeTruthy();
    expect(loadSnippets().length).toBe(1);
  });

  it("uses the text as label if label is empty", () => {
    const s = addSnippet("", "Some long snippet text");
    expect(s.label).toBe("Some long snippet text");
  });

  it("uses first 40 chars as label if both are empty", () => {
    const s = addSnippet("  ", "0123456789012345678901234567890123456789extra");
    expect(s.label.length).toBeLessThanOrEqual(40);
  });

  it("deletes a snippet", () => {
    const s = addSnippet("Test", "Some text");
    deleteSnippet(s.id);
    expect(loadSnippets()).toEqual([]);
  });

  it("preserves order (newest first)", () => {
    const a = addSnippet("A", "first");
    const b = addSnippet("B", "second");
    const list = loadSnippets();
    expect(list[0]!.id).toBe(b.id);
    expect(list[1]!.id).toBe(a.id);
  });

  it("handles malformed JSON gracefully", () => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("careerforge-snippets-v1", "{not json");
      expect(loadSnippets()).toEqual([]);
    }
  });
});
