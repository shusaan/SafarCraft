import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OnboardingPage from "@/app/onboarding/page";

// Mock next/navigation so the router.push in the CTA buttons doesn't blow up.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

// Mock analytics — the page calls trackEvent on mount and on click.
vi.mock("@/engines/analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("/onboarding branch page", () => {
  it("shows the two-card choice", () => {
    render(<OnboardingPage />);
    expect(screen.getByText(/Two ways in\./)).toBeTruthy();
    expect(screen.getByText("Import your existing CV")).toBeTruthy();
    expect(screen.getByText("Start from scratch")).toBeTruthy();
    expect(screen.getByText("Most popular")).toBeTruthy();
  });

  it("has a skip-to-builder link", () => {
    render(<OnboardingPage />);
    const skipLink = screen.getByText(/Skip and go straight to the builder/);
    expect(skipLink.getAttribute("href")).toBe("/builder");
  });

  it("has 6 bullet points (3 per card)", () => {
    render(<OnboardingPage />);
    const items = screen.getAllByRole("listitem");
    expect(items.length).toBe(6);
  });
});
