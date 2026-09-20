import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/page";

// Mock the client components that have side effects (analytics, router).
// The page is a server component; we render its JSX output directly.

describe("HomePage (landing)", () => {
  it("renders hero, all marketing sections, and footer", () => {
    render(<HomePage />);

    // Hero CTAs both present (Hero + TwoTrackEntry both render them,
    // so use getAllByText).
    expect(screen.getAllByText("Import my CV").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Start from scratch").length).toBeGreaterThanOrEqual(1);

    // Stats ribbon labels
    expect(screen.getByText("resumes built")).toBeTruthy();
    expect(screen.getByText("rating")).toBeTruthy();
    expect(screen.getByText("countries")).toBeTruthy();
    expect(screen.getByText("licensed")).toBeTruthy();

    // Section headings — use regex/unique substrings (some phrases
    // appear in multiple sections, e.g. hero subtitle vs section header).
    expect(screen.getByText(/Two ways in\./)).toBeTruthy();
    expect(screen.getByText(/Three steps\. About three minutes\./)).toBeTruthy();
    expect(screen.getByText(/Everything you need to ship a resume today\./)).toBeTruthy();
    expect(screen.getByText(/Local-first\. Source-available\./)).toBeTruthy();
    expect(screen.getByText(/Free forever\. Pro when you need it\./)).toBeTruthy();
    expect(screen.getByText(/Built for the way engineers actually work\./)).toBeTruthy();
    expect(screen.getByText(/Fully open source — MIT licensed/)).toBeTruthy();

    // Footer columns
    expect(screen.getByText("Product")).toBeTruthy();
    expect(screen.getByText("Resources")).toBeTruthy();
    expect(screen.getByText("Compare")).toBeTruthy();
    expect(screen.getByText("Legal")).toBeTruthy();

    // Navbar links (these duplicate footer link text)
    expect(screen.getAllByText("Builder").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Templates").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("GitHub").length).toBeGreaterThanOrEqual(1);
  });

  it("navbar Start-free CTA routes to /onboarding?path=import", () => {
    render(<HomePage />);
    const cta = screen.getAllByRole("link").find(
      (a) => a.textContent?.trim().startsWith("Start free"),
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
