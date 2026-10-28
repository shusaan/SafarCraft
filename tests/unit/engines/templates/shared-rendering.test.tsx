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

  it("renders the profile photo on templates with photo support", async () => {
    const photoData = "data:image/png;base64,ZmFrZS1pbWFnZQ==";
    const data = {
      ...defaultResumeData,
      personal: { ...defaultResumeData.personal, name: "Jane Doe", photo: photoData },
    };
    const layout = { ...defaultResumeLayout, showPicture: true };

    for (const template of ["leafish", "pikachu", "modern-professional", "bronzor", "onyx", "gengar", "executive"]) {
      const html = await renderResumeHtml(template, data, layout);
      expect(html).toContain(photoData);
    }
  });

  it("skips the profile photo on the classic-ats template by design", async () => {
    const photoData = "data:image/png;base64,ZmFrZS1pbWFnZQ==";
    const data = {
      ...defaultResumeData,
      personal: { ...defaultResumeData.personal, name: "Jane Doe", photo: photoData },
    };
    const html = await renderResumeHtml("classic-ats", data, {
      ...defaultResumeLayout,
      showPicture: true,
    });

    expect(html).not.toContain(photoData);
  });
});
