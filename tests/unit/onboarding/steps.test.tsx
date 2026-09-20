import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepPersonal } from "@/components/onboarding/steps/step-personal";
import { StepExperience } from "@/components/onboarding/steps/step-experience";
import { StepEducation } from "@/components/onboarding/steps/step-education";
import { StepExtras } from "@/components/onboarding/steps/step-extras";
import { StepReview } from "@/components/onboarding/steps/step-review";
import { useResumeStore } from "@/stores/resume-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/engines/analytics", () => ({ trackEvent: vi.fn() }));

function resetStore() {
  // Default = empty resume.
  useResumeStore.setState({
    data: {
      personal: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        website: "",
        photo: null,
        summary: "",
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      publications: [],
    },
    template: "classic-ats",
  } as Partial<ReturnType<typeof useResumeStore.getState>>);
}

describe("StepPersonal", () => {
  beforeEach(resetStore);

  it("renders all required inputs", () => {
    render(<StepPersonal />);
    expect(screen.getByLabelText(/Full name/)).toBeTruthy();
    expect(screen.getByLabelText(/^Email/)).toBeTruthy();
    expect(screen.getByLabelText(/^Phone/)).toBeTruthy();
    expect(screen.getByLabelText(/^Location/)).toBeTruthy();
    expect(screen.getByLabelText(/^LinkedIn/)).toBeTruthy();
    expect(screen.getByLabelText(/^GitHub/)).toBeTruthy();
    expect(screen.getByLabelText(/Professional summary/)).toBeTruthy();
  });

  it("persists typed values into the store", async () => {
    const user = userEvent.setup();
    render(<StepPersonal />);
    await user.type(screen.getByLabelText(/Full name/), "Jane Doe");
    expect(useResumeStore.getState().data.personal.name).toBe("Jane Doe");
  });

  it("shows an email error for malformed addresses", async () => {
    const user = userEvent.setup();
    const { container } = render(<StepPersonal />);
    await user.type(screen.getByLabelText(/^Email/), "not-an-email");
    // Filter alerts to ones inside the StepPersonal form to skip the
    // global ErrorBoundary mount.
    const alerts = Array.from(container.querySelectorAll('[role="alert"]'))
      .map((el) => el.textContent ?? "")
      .filter((t) => /valid email/i.test(t));
    expect(alerts.length).toBeGreaterThanOrEqual(1);
  });
});

describe("StepExperience", () => {
  beforeEach(resetStore);

  it("renders empty hint when there are no entries", () => {
    render(<StepExperience />);
    expect(screen.getByText(/No roles yet/)).toBeTruthy();
  });

  it("adding a role shows an entry form with bullets textarea", async () => {
    const user = userEvent.setup();
    render(<StepExperience />);
    await user.click(screen.getByRole("button", { name: /Add first role/ }));
    expect(screen.getByText(/Role #1/)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Senior Software Engineer/)).toBeTruthy();
    expect(screen.getByPlaceholderText(/Led a team/)).toBeTruthy();
  });

  it("removes a role when the trash icon is clicked", async () => {
    const user = userEvent.setup();
    render(<StepExperience />);
    await user.click(screen.getByRole("button", { name: /Add first role/ }));
    expect(screen.getByText(/Role #1/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Remove role 1/ }));
    expect(screen.queryByText(/Role #1/)).toBeNull();
  });
});

describe("StepEducation", () => {
  beforeEach(resetStore);
  it("renders empty hint and add-first-school CTA", () => {
    render(<StepEducation />);
    expect(screen.getByText(/No schools yet/)).toBeTruthy();
  });
});

describe("StepExtras", () => {
  beforeEach(resetStore);
  it("starts on the Skills tab", () => {
    render(<StepExtras />);
    expect(screen.getByRole("tab", { name: /Skills/ }).getAttribute("aria-selected")).toBe("true");
  });

  it("switches to Projects tab when clicked", async () => {
    const user = userEvent.setup();
    render(<StepExtras />);
    await user.click(screen.getByRole("tab", { name: /Projects/ }));
    expect(screen.getByRole("tab", { name: /Projects/ }).getAttribute("aria-selected")).toBe("true");
  });
});

describe("StepReview", () => {
  beforeEach(resetStore);
  it("renders 8 template options", () => {
    render(<StepReview />);
    const buttons = screen.getAllByRole("button", { name: /Classic ATS|Modern Professional|Executive|Pikachu|Onyx|Leafish|Bronzor|Gengar/ });
    expect(buttons.length).toBe(8);
  });

  it("renders the what-you-added summary", () => {
    render(<StepReview />);
    expect(screen.getByText(/What you've added/)).toBeTruthy();
  });
});
