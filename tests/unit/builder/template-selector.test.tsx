import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TemplateSelector } from "@/components/template-selector/template-selector";

const setTemplateMock = vi.fn();
const setLayoutMock = vi.fn();

vi.mock("@/stores/resume-store", () => ({
  useResumeStore: vi.fn(<T,>(selector: (state: {
    template: string;
    setTemplate: typeof setTemplateMock;
    layout: {
      columns: "one";
      showPicture: boolean;
      picturePosition: "left";
      primaryColor: string;
      fontSize: "medium";
      spacing: "normal";
    };
    setLayout: typeof setLayoutMock;
  }) => T) =>
    selector({
      template: "classic-ats",
      setTemplate: setTemplateMock,
      layout: {
        columns: "one",
        showPicture: false,
        picturePosition: "left",
        primaryColor: "#1a56db",
        fontSize: "medium",
        spacing: "normal",
      },
      setLayout: setLayoutMock,
    })),
}));

vi.mock("@/components/marketing/template-preview", () => ({
  TemplatePreview: ({ id }: { id: string }) => <div data-template-preview={id} />,
}));

describe("TemplateSelector", () => {
  it("renders every template as an accessible button", () => {
    const { container } = render(<TemplateSelector />);
    const cards = container.querySelectorAll('[role="button"][aria-pressed]');
    expect(cards.length).toBe(8);
    expect(screen.getByRole("button", { name: /Use the Classic ATS template/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("selects a template by click", () => {
    render(<TemplateSelector />);
    fireEvent.click(screen.getByRole("button", { name: /Use the Modern Professional template/ }));
    expect(setTemplateMock).toHaveBeenCalledWith("modern-professional");
  });

  it("selects a template with the keyboard", () => {
    render(<TemplateSelector />);
    const card = screen.getByRole("button", { name: /Use the Executive template/ });
    fireEvent.keyDown(card, { key: "Enter" });
    fireEvent.keyDown(card, { key: " " });
    expect(setTemplateMock).toHaveBeenCalledWith("executive");
  });
});
