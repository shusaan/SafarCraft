import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Container } from "@/components/primitives/container";
import { Section } from "@/components/primitives/section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

describe("Marketing primitives", () => {
  it("Container renders with default max-width and horizontal padding", () => {
    const { container } = render(<Container>Hi</Container>);
    const root = container.firstChild as HTMLElement;
    expect(root).toBeTruthy();
    expect(root.className).toContain("max-w-6xl");
    expect(root.className).toContain("mx-auto");
    expect(root.className).toContain("px-6");
  });

  it("Container accepts size=narrow / wide", () => {
    const { container: a } = render(<Container size="narrow">x</Container>);
    const { container: b } = render(<Container size="wide">x</Container>);
    expect((a.firstChild as HTMLElement).className).toContain("max-w-4xl");
    expect((b.firstChild as HTMLElement).className).toContain("max-w-7xl");
  });

  it("Section renders default spacing & background", () => {
    const { container } = render(<Section>body</Section>);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("py-20");
    expect(root.className).toContain("md:py-24");
    expect(root.className).toContain("bg-background");
  });

  it("Section supports gradient background", () => {
    const { container } = render(<Section background="gradient">g</Section>);
    expect((container.firstChild as HTMLElement).className).toContain("bg-gradient-to-b");
  });

  it("Button renders gradient + display sizes", () => {
    const { container } = render(
      <Button variant="gradient" size="display-md">
        Start free
      </Button>,
    );
    const btn = container.firstChild as HTMLElement;
    expect(btn.className).toContain("bg-gradient-to-r");
    expect(btn.className).toContain("h-14");
    expect(btn.className).toContain("px-10");
  });

  it("Badge brand variant present", () => {
    const { container } = render(<Badge variant="brand">brand</Badge>);
    expect((container.firstChild as HTMLElement).className).toContain("border-primary/30");
  });
});
