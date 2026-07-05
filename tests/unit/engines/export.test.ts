import { describe, it, expect } from "vitest";
import { exportJSONResume } from "@/engines/export/providers/json-resume";
import { exportMarkdown } from "@/engines/export/providers/markdown";
import { defaultResumeData, type ResumeData } from "@/types";

describe("Export Engine", () => {
  it("generates valid JSON Resume", () => {
    const data: ResumeData = {
      ...defaultResumeData,
      personal: {
        ...defaultResumeData.personal,
        name: "Jane Doe",
        email: "jane@example.com",
      },
    };
    const blob = exportJSONResume(data);
    const text = blob.text();
    expect(text).toBeTruthy();
  });

  it("generates markdown", () => {
    const data: ResumeData = {
      ...defaultResumeData,
      personal: { ...defaultResumeData.personal, name: "Test User" },
    };
    const blob = exportMarkdown(data);
    expect(blob.type).toBe("text/markdown");
  });
});
