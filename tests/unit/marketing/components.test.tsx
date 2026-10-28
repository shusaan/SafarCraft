import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/marketing/hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { BuiltForEngineers } from "@/components/marketing/built-for-engineers";

describe("SectionHeader", () => {
  it("renders eyebrow, title and description", () => {
    render(
      <SectionHeader
        eyebrow="Hello"
        title="World"
        description="A nice greeting."
      />,
    );
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByText("World")).toBeTruthy();
    expect(screen.getByText("A nice greeting.")).toBeTruthy();
  });

  it("centers content when align=center", () => {
    const { container } = render(
      <SectionHeader title="C" align="center" />,
    );
    expect((container.firstChild as HTMLElement).className).toContain("mx-auto text-center");
  });
});

describe("Hero", () => {
  it("renders two CTAs routing to /onboarding", () => {
    const { container } = render(<Hero />);
    const links = container.querySelectorAll("a");
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/onboarding?path=import");
    expect(hrefs).toContain("/onboarding?path=scratch");
  });

  it("headline uses display tracking-tight", () => {
    const { container } = render(<Hero />);
    const h1 = container.querySelector("h1");
    expect(h1?.className).toContain("tracking-tight");
    expect(h1?.textContent).toContain("clearly told");
  });

  it("trust strip is qualitative (no fake metrics)", () => {
    const { container } = render(<Hero />);
    expect(container.textContent).toContain("Private by default");
    expect(container.textContent).toContain("8 resume templates");
    expect(container.textContent).toContain("PDF, DOCX, and JSON exports");
  });

  it("shows the editor preview", () => {
    const { container } = render(<Hero />);
    expect(
      container.querySelector('[aria-label="Illustrative resume editor preview"]'),
    ).toBeTruthy();
  });
});

describe("FeaturesGrid", () => {
  it("renders 6 features", () => {
    const { container } = render(<FeaturesGrid />);
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it("features mention templates and JSON Resume", () => {
    const { container } = render(<FeaturesGrid />);
    expect(container.textContent).toContain("Resume templates");
    expect(container.textContent).toContain("JSON Resume");
  });
});

describe("HowItWorks", () => {
  it("renders 3 steps", () => {
    const { container } = render(<HowItWorks />);
    expect(container.querySelectorAll("ol > li").length).toBe(3);
  });
});

describe("PricingTeaser", () => {
  it("shows a single free card at $0", () => {
    const { container } = render(<PricingTeaser />);
    expect(container.textContent).toContain("Everything is free.");
    expect(container.textContent).toContain("$0");
  });

  it("does not advertise a paid tier", () => {
    const { container } = render(<PricingTeaser />);
    expect(container.textContent).not.toContain("$5");
    expect(container.textContent).not.toContain("Coming soon");
    expect(container.textContent).not.toContain("Pro");
  });
});

describe("BuiltForEngineers", () => {
  it("renders code snippet and three feature pills", () => {
    const { container } = render(<BuiltForEngineers />);
    expect(container.querySelector("pre")).toBeTruthy();
    expect(container.textContent).toContain("reviewResume");
    expect(container.textContent).toContain("Open source");
  });
});
