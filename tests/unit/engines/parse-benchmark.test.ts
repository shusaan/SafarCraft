import { describe, it, expect } from "vitest";
import { checkDocxParse, verifyResumeText } from "@/engines/export/parse-benchmark";
import { checkHtmlParse } from "@/engines/export/parse-benchmark-html";
import { templatePreviewData, templatePreviewLayouts } from "@/data/template-preview";
import { templateRegistry } from "@/engines/templates/registry";

const templateIds = Object.keys(templateRegistry) as Array<keyof typeof templateRegistry>;

describe("export parse benchmark", () => {
  it.each(templateIds)("HTML export preserves key fields for %s", async (template) => {
    const result = await checkHtmlParse(
      templatePreviewData,
      template,
      templatePreviewLayouts[template],
    );

    expect(result.error).toBeUndefined();
    expect(result.checks.length).toBeGreaterThan(5);
    expect(result.passed).toBe(true);
  });

  it("DOCX export preserves key fields", async () => {
    const result = await checkDocxParse(templatePreviewData);
    expect(result.error).toBeUndefined();
    expect(result.passed).toBe(true);
  });

  it("flags missing fields", () => {
    const checks = verifyResumeText("Ayesha Khan", templatePreviewData);
    expect(checks.some((check) => check.field === "Name" && check.found)).toBe(true);
    expect(checks.some((check) => check.field === "Email" && !check.found)).toBe(true);
    expect(checks.every((check) => check.field !== "Email" || !check.found)).toBe(true);
  });
});
