import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonalInfoForm } from "../personal-info-form";
import { ToastProviderWrapper } from "@/components/ui/toast";

const updateDataMock = vi.fn();
const updatePersonalMock = vi.fn();
const undoMock = vi.fn();

const baseState = {
  data: {
    personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "", photo: null },
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    publications: [],
  },
  updatePersonal: updatePersonalMock,
  updateData: updateDataMock,
  undo: undoMock,
};

vi.mock("@/stores/resume-store", () => ({
  useResumeStore: vi.fn(<T,>(selector: (s: typeof baseState) => T) => selector(baseState)),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProviderWrapper>{ui}</ToastProviderWrapper>);
}

const fakeParsed = {
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "(555) 123-4567",
  location: "Boston, MA",
  linkedin: "linkedin.com/in/jane",
  github: "github.com/jane",
  website: "",
  summary: "Senior engineer with 10 years experience.",
  skillGroups: [
    { category: "Languages", skills: ["TypeScript", "Python"] },
  ],
  experience: [
    {
      company: "Acme",
      position: "Senior Engineer",
      location: "Boston, MA",
      startDate: "2020-01",
      endDate: "Present",
      current: true,
      bullets: ["Did cool things", "Did more cool things"],
      technologies: [],
    },
  ],
  education: [
    { institution: "MIT", degree: "BSc Computer Science", field: "CS", location: "", startDate: "2012-01", endDate: "2016-01", gpa: "", honors: [] },
  ],
  projects: [],
  certifications: [],
  languages: [{ language: "English", proficiency: "Native" }],
};

function mockParseResponse(parsed: unknown = fakeParsed, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => (parsed === null ? { error: "no go" } : { parsed }),
  }) as unknown as typeof fetch;
}

beforeEach(() => {
  updateDataMock.mockClear();
  updatePersonalMock.mockClear();
  undoMock.mockClear();
});

describe("PersonalInfoForm — import flow", () => {
  it("renders form fields", () => {
    renderWithProviders(<PersonalInfoForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders photo upload area", () => {
    renderWithProviders(<PersonalInfoForm />);
    expect(screen.getByText(/profile photo/i)).toBeInTheDocument();
  });

  it("renders Import Existing CV panel", () => {
    renderWithProviders(<PersonalInfoForm />);
    expect(screen.getByText(/Import Existing CV/i)).toBeInTheDocument();
  });

  it("shows a preview card with field counts after a successful parse", async () => {
    mockParseResponse();
    const user = userEvent.setup();
    renderWithProviders(<PersonalInfoForm />);

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    const fileInput = screen.getByTestId("cv-file-input") as HTMLInputElement;
    await user.upload(fileInput, file);

    const preview = await screen.findByTestId("cv-preview-card");
    expect(preview).toBeInTheDocument();
    expect(preview).toHaveTextContent("resume.pdf");
    expect(preview).toHaveTextContent("Name");
    expect(preview).toHaveTextContent("Experience");
    expect(preview).toHaveTextContent("1");
  });

  it("does NOT call updateData until the user clicks Apply", async () => {
    mockParseResponse();
    const user = userEvent.setup();
    renderWithProviders(<PersonalInfoForm />);

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await user.upload(screen.getByTestId("cv-file-input"), file);

    await screen.findByTestId("cv-apply-button");
    expect(updateDataMock).not.toHaveBeenCalled();

    await user.click(screen.getByTestId("cv-apply-button"));
    expect(updateDataMock).toHaveBeenCalledTimes(1);
  });

  it("Discard button hides the preview without calling updateData", async () => {
    mockParseResponse();
    const user = userEvent.setup();
    renderWithProviders(<PersonalInfoForm />);

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await user.upload(screen.getByTestId("cv-file-input"), file);

    await screen.findByTestId("cv-preview-card");
    await user.click(screen.getByTestId("cv-discard-button"));

    expect(updateDataMock).not.toHaveBeenCalled();
    expect(screen.queryByTestId("cv-preview-card")).not.toBeInTheDocument();
  });

  it("preserves existing skills when parser returns no skill groups", async () => {
    mockParseResponse({ ...fakeParsed, skillGroups: [] });
    const user = userEvent.setup();
    renderWithProviders(<PersonalInfoForm />);

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await user.upload(screen.getByTestId("cv-file-input"), file);

    await user.click(await screen.findByTestId("cv-apply-button"));

    const call = updateDataMock.mock.calls[0]?.[0] as Record<string, unknown>;
    // parser returned no skill groups → partial should not include 'skills',
    // so the store merges without touching existing skills.
    expect("skills" in call).toBe(false);
    expect(call.personal).toBeDefined();
  });

  it("shows error toast without 'Create from Scratch' wording when parse fails", async () => {
    mockParseResponse(null, false);
    const user = userEvent.setup();
    renderWithProviders(<PersonalInfoForm />);

    const file = new File(["dummy"], "scan.pdf", { type: "application/pdf" });
    await user.upload(screen.getByTestId("cv-file-input"), file);

    await waitFor(() => {
      const body = document.body.textContent ?? "";
      expect(body).not.toMatch(/Create from Scratch/);
    });
  });

  it("Undo button after Apply calls the store undo", async () => {
    mockParseResponse();
    const user = userEvent.setup();
    renderWithProviders(<PersonalInfoForm />);

    const file = new File(["dummy"], "resume.pdf", { type: "application/pdf" });
    await user.upload(screen.getByTestId("cv-file-input"), file);

    await user.click(await screen.findByTestId("cv-apply-button"));
    await user.click(screen.getByTestId("cv-undo-button"));

    expect(undoMock).toHaveBeenCalledTimes(1);
  });
});
