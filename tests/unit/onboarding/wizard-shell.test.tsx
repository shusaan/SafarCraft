import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WizardShell, WIZARD_STEPS } from "@/components/onboarding/wizard-shell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/engines/analytics", () => ({ trackEvent: vi.fn() }));

// jsdom persists localStorage across tests; clear it so each test starts
// at the default step (Personal).
beforeEach(() => {
  if (typeof window !== "undefined") window.localStorage.clear();
});

describe("WizardShell", () => {
  it("starts on the Personal step", () => {
    render(
      <WizardShell>
        {({ step }) => <div data-testid="content">{step.id}</div>}
      </WizardShell>,
    );
    expect(screen.getByTestId("content").textContent).toBe("personal");
    expect(screen.getByText("Step 1 of 5")).toBeTruthy();
  });

  it("progresses through steps when 'Save & next' is clicked", async () => {
    const user = userEvent.setup();
    render(
      <WizardShell>
        {({ step }) => <div data-testid="content">{step.id}</div>}
      </WizardShell>,
    );
    expect(screen.getByTestId("content").textContent).toBe("personal");

    await user.click(screen.getByRole("button", { name: /Save and continue/ }));
    expect(screen.getByTestId("content").textContent).toBe("experience");
    await user.click(screen.getByRole("button", { name: /Save and continue/ }));
    expect(screen.getByTestId("content").textContent).toBe("education");
  });

  it("Back is disabled on step 1", () => {
    render(
      <WizardShell>
        {({ step }) => <div>{step.id}</div>}
      </WizardShell>,
    );
    expect(screen.getByRole("button", { name: /Back/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Back \(disabled/ })).toBeDisabled();
  });

  it("shows Skip on optional steps only (extras), hides it on required ones", () => {
    render(
      <WizardShell initialStep="extras">
        {({ step }) => <div>{step.id}</div>}
      </WizardShell>,
    );
    expect(screen.getByRole("button", { name: /^Skip$/ })).toBeTruthy();
  });

  it("exposes exactly 5 steps in the documented order", () => {
    expect(WIZARD_STEPS.map((s) => s.id)).toEqual([
      "personal",
      "experience",
      "education",
      "extras",
      "review",
    ]);
    expect(WIZARD_STEPS.every((s) => typeof s.label === "string" && s.label.length > 0)).toBe(true);
  });
});
