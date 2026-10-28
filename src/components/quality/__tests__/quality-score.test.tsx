import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QualityScore } from "../quality-score";
import type { ResumeData } from "@/types";

const emptyData: ResumeData = {
  personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "", photo: null },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  publications: [],
};

const filledData: ResumeData = {
  ...emptyData,
  personal: { ...emptyData.personal, name: "Jane Doe", email: "jane@example.com" },
  experience: [
    {
      id: "e1",
      company: "Acme",
      position: "Engineer",
      location: "Remote",
      startDate: "2020-01",
      endDate: "",
      current: true,
      bullets: ["Shipped a feature used by 10k users"],
      technologies: [],
    },
  ],
};

let mockState = { data: emptyData };

vi.mock("@/stores/resume-store", () => ({
  useResumeStore: vi.fn(<T,>(selector: (s: typeof mockState) => T) => selector(mockState)),
}));

describe("QualityScore — empty resume", () => {
  it("shows an empty state instead of a misleading score for a blank resume", () => {
    mockState = { data: emptyData };
    render(<QualityScore />);
    expect(screen.getByTestId("quality-empty-state")).toBeInTheDocument();
    expect(screen.getByText(/nothing to score yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/\/ 100 overall/i)).not.toBeInTheDocument();
  });

  it("shows the score once the resume has content", () => {
    mockState = { data: filledData };
    render(<QualityScore />);
    expect(screen.queryByTestId("quality-empty-state")).not.toBeInTheDocument();
    expect(screen.getByText(/\/ 100 overall/i)).toBeInTheDocument();
  });
});
