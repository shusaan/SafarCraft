import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BuilderStepper } from "@/components/builder/builder-stepper";
import type { ResumeData } from "@/types";

const data: ResumeData = {
  personal: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    photo: null,
    summary: "",
  },
  experience: [{
    id: "e1",
    company: "Acme",
    position: "Engineer",
    location: "",
    startDate: "2020",
    endDate: "2023",
    current: false,
    bullets: ["Shipped a feature used by 10k users"],
    technologies: [],
  }],
  education: [],
  skills: [{ id: "s1", category: "Language", skills: ["TypeScript"] }],
  certifications: [],
  projects: [],
  languages: [],
  publications: [],
};

vi.mock("@/stores/resume-store", () => ({
  useResumeStore: vi.fn(<T,>(selector: (state: { data: ResumeData }) => T) => selector({ data })),
}));

describe("BuilderStepper", () => {
  it("renders all five steps with accessible names", () => {
    render(<BuilderStepper activeSection="experience" activePanel="editor" onNavigate={vi.fn()} />);

    expect(screen.getByRole("navigation", { name: "Resume builder progress" })).toBeInTheDocument();
    for (const label of ["Personal Info", "Experience", "Education & Skills", "Projects & More", "ATS & Export"]) {
      expect(screen.getByRole("button", { name: new RegExp(label) })).toBeInTheDocument();
    }
  });

  it("marks the current step and reports completed sections", () => {
    render(<BuilderStepper activeSection="experience" activePanel="editor" onNavigate={vi.fn()} />);

    const current = screen.getByRole("button", { current: "step" });
    expect(current).toHaveAttribute("aria-label", expect.stringContaining("Experience"));
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "3");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "4");
  });

  it("does not force Personal Info to be current for non-step panels", () => {
    render(<BuilderStepper activeSection="personal" activePanel="templates" onNavigate={vi.fn()} />);

    expect(screen.queryByRole("button", { current: "step" })).toBeNull();
  });

  it("removes the 100% free pill from the progress row", () => {
    render(<BuilderStepper activeSection="personal" activePanel="editor" onNavigate={vi.fn()} />);
    expect(screen.queryByText("100% free")).toBeNull();
  });
});
