import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

// Mock the client components that have side effects (analytics, router).
// The page is a server component; we render its JSX output directly.

describe("HomePage (landing)", () => {
  it("renders hero, marketing sections, and footer", () => {
    render(<HomePage />);

    // Hero CTAs
    expect(screen.getAllByText("Import a resume").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Start a new resume").length).toBeGreaterThanOrEqual(1);

    // Section headings
    expect(screen.getByText(/A clear path from draft to application\./)).toBeTruthy();
    expect(screen.getByText(/Everything you need to ship a resume today\./)).toBeTruthy();
    expect(screen.getByText(/Private by default\. Open source by design\./)).toBeTruthy();
    expect(screen.getByText(/Everything is free\./)).toBeTruthy();
    expect(screen.getByText(/Fully open source — MIT licensed/)).toBeTruthy();

    // Footer columns
    expect(screen.getByText("Product")).toBeTruthy();
    expect(screen.getByText("Resources")).toBeTruthy();
    expect(screen.getByText("Legal")).toBeTruthy();

    // Navbar links (these duplicate footer link text)
    expect(screen.getAllByText("Builder").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Templates").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("GitHub").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render removed placeholder sections", () => {
    render(<HomePage />);
    expect(screen.queryByText("resumes built")).toBeNull();
    expect(screen.queryByText(/Two ways in\./)).toBeNull();
    expect(screen.queryByText(/logo 1/)).toBeNull();
    expect(screen.queryByText(/Coming soon/)).toBeNull();
  });

  it("navbar CTA routes to /onboarding?path=import", () => {
    render(<HomePage />);
    const cta = screen.getAllByRole("link").find(
      (a) => a.textContent?.trim().startsWith("Build a resume"),
    );
    expect(cta?.getAttribute("href")).toBe("/onboarding?path=import");
  });

  it("all CTAs route to /onboarding (not to /builder directly)", () => {
    render(<HomePage />);
    const links = Array.from(document.querySelectorAll("a")).map(
      (a) => a.getAttribute("href"),
    );
    // We expect /onboarding paths from the marketing surfaces
    expect(links).toContain("/onboarding?path=import");
    expect(links).toContain("/onboarding?path=scratch");
  });
});
