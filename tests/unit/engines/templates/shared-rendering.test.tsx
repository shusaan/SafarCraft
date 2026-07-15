import { describe, expect, it } from "vitest";
import { renderResumeHtml } from "@/engines/export/render-resume-html";
import { defaultResumeData, defaultResumeLayout } from "@/types";

describe("shared resume document rendering", () => {
  it("renders the selected template into exportable HTML", async () => {
    const html = await renderResumeHtml("classic-ats", {
      ...defaultResumeData,
      personal: {
        ...defaultResumeData.personal,
        name: "Jane Doe",
        summary: "Senior engineer with a strong background in product delivery.",
      },
      experience: [
        {
          id: "exp-1",
          company: "Acme",
          position: "Staff Engineer",
          location: "Remote",
          startDate: "2022",
          endDate: "Present",
          current: true,
          bullets: ["Led the API migration."],
          technologies: ["TypeScript"],
        },
      ],
    }, defaultResumeLayout);

    expect(html).toContain("resume-document");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("Summary");
    expect(html).toContain("Staff Engineer");
  });
});
