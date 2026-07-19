import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonalInfoForm } from "../personal-info-form";
import { ToastProviderWrapper } from "@/components/ui/toast";

vi.mock("@/stores/resume-store", () => ({
  useResumeStore: vi.fn((selector) => {
    const state = {
      data: {
        personal: { name: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "", summary: "", photo: null },
      },
      updatePersonal: vi.fn(),
    };
    return selector(state);
  }),
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProviderWrapper>{ui}</ToastProviderWrapper>);
}

describe("PersonalInfoForm", () => {
  it("renders form fields", () => {
    renderWithProviders(<PersonalInfoForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it("renders photo upload area", () => {
    renderWithProviders(<PersonalInfoForm />);
    expect(screen.getByText(/profile photo/i)).toBeInTheDocument();
  });
});
