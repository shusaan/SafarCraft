import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/marketing/hero";
import { SectionHeader } from "@/components/marketing/section-header";
import { FeaturesGrid } from "@/components/marketing/features-grid";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { TwoTrackEntry } from "@/components/marketing/two-track-entry";
import { PricingTeaser } from "@/components/marketing/pricing-teaser";
import { SocialProof } from "@/components/marketing/social-proof";
import { BuiltForEngineers } from "@/components/marketing/built-for-engineers";
import { StatsRibbon } from "@/components/marketing/stats-ribbon";

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
    expect(h1?.textContent).toContain("ATS-friendly");
  });

  it("trust strip is qualitative (no fake metrics)", () => {
    const { container } = render(<Hero />);
    expect(container.textContent).toContain("Your data stays in your browser");
    expect(container.textContent).toContain("8 ATS-tested templates");
    expect(container.textContent).toContain("Export PDF, DOCX, JSON Resume");
  });
});

describe("FeaturesGrid", () => {
  it("renders 6 features", () => {
    const { container } = render(<FeaturesGrid />);
    const items = container.querySelectorAll("li");
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it("features mention ATS-tested and JSON Resume", () => {
    const { container } = render(<FeaturesGrid />);
    expect(container.textContent).toContain("ATS-tested templates");
    expect(container.textContent).toContain("JSON Resume");
  });
});

describe("HowItWorks", () => {
  it("renders 3 steps", () => {
    const { container } = render(<HowItWorks />);
    expect(container.querySelectorAll("ol > li").length).toBe(3);
  });
});

describe("TwoTrackEntry", () => {
  it("offers both Import and Scratch paths", () => {
    const { container } = render(<TwoTrackEntry />);
    const links = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(links).toContain("/onboarding?path=import");
    expect(links).toContain("/onboarding?path=scratch");
  });

  it("marks Import as the popular option", () => {
    const { container } = render(<TwoTrackEntry />);
    expect(container.textContent).toContain("Most popular");
  });
});

describe("PricingTeaser", () => {
  it("shows Free tier at $0", () => {
    const { container } = render(<PricingTeaser />);
    expect(container.textContent).toContain("Free");
    expect(container.textContent).toContain("$0");
  });

  it("shows Pro tier as coming soon", () => {
    const { container } = render(<PricingTeaser />);
    expect(container.textContent).toContain("Coming soon");
    expect(container.textContent).toContain("$5");
  });
});

describe("SocialProof", () => {
  it("renders 6 placeholder boxes (TODO real logos)", () => {
    const { container } = render(<SocialProof />);
    const items = container.querySelectorAll("li");
    expect(items.length).toBe(6);
    expect(container.textContent).toContain("logo 1");
  });
});

describe("BuiltForEngineers", () => {
  it("renders code snippet and three feature pills", () => {
    const { container } = render(<BuiltForEngineers />);
    expect(container.querySelector("pre")).toBeTruthy();
    expect(container.textContent).toContain("calculateAts");
    expect(container.textContent).toContain("Open source");
  });
});

describe("StatsRibbon", () => {
  it("renders placeholder stats with TODO marker", () => {
    const { container } = render(<StatsRibbon />);
    expect(container.textContent).toContain("resumes built");
    expect(container.querySelector(".sr-only")?.textContent).toContain("TODO");
  });
});
