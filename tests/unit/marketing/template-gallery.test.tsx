import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemplateGallery } from "@/components/marketing/template-gallery";
import { templateRegistry } from "@/engines/templates/registry";

vi.mock("@/components/marketing/template-preview", () => ({
  TemplatePreview: ({ id }: { id: string }) => <div data-template-preview={id} />,
}));

describe("TemplateGallery", () => {
  it("renders a real preview for every registered template", () => {
    render(<TemplateGallery />);
    expect(document.querySelectorAll("[data-template-preview]").length).toBe(
      Object.keys(templateRegistry).length,
    );
  });

  it("links each card to the matching builder template", () => {
    render(<TemplateGallery />);
    const hrefs = Array.from(document.querySelectorAll('a[href*="template="]')).map((link) =>
      link.getAttribute("href"),
    );

    expect(hrefs).toContain("/builder?panel=templates&template=classic-ats");
    expect(hrefs).toContain("/builder?panel=templates&template=gengar");
    expect(hrefs).not.toContain("/onboarding?path=scratch");
  });

  it("keeps the generic template chooser as a separate CTA", () => {
    render(<TemplateGallery />);
    expect(screen.getByRole("link", { name: /Start with a free template/ })).toHaveAttribute(
      "href",
      "/builder?panel=templates",
    );
  });
});
