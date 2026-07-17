import { describe, expect, it } from "vitest";
import { renderResumeHtml } from "@/engines/export/render-resume-html";
import { defaultResumeData, defaultResumeLayout } from "@/types";

describe("renderResumeHtml", () => {
  it("renders the selected template markup for PDF export", async () => {
    const html = await renderResumeHtml("classic-ats", defaultResumeData, defaultResumeLayout);

    expect(html).toContain("resume-page");
    expect(html).toContain("Your Name");
    expect(html).toContain("resume-document");
  });
});
