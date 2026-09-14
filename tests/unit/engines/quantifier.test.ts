import { describe, it, expect } from "vitest";
import { needsMetric, detectCategory, suggestMetricHint } from "@/engines/rewriter/quantifier";

describe("quantifier", () => {
  it("flags a bullet with no number", () => {
    expect(needsMetric("Led the migration to microservices")).toBe(true);
  });

  it("does NOT flag a bullet with a percentage", () => {
    expect(needsMetric("Reduced latency by 40%")).toBe(false);
  });

  it("does NOT flag a bullet with a $ amount", () => {
    expect(needsMetric("Saved $120k in infrastructure costs")).toBe(false);
  });

  it("does NOT flag a bullet with a number", () => {
    expect(needsMetric("Migrated 12 services in 3 weeks")).toBe(false);
  });

  it("does NOT flag a bullet with ms latency", () => {
    expect(needsMetric("Cut p99 from 800ms to 200ms")).toBe(false);
  });

  it("does NOT flag a bullet with 'team of N'", () => {
    expect(needsMetric("Mentored a team of 6 engineers")).toBe(false);
  });

  it("does NOT flag a very short bullet", () => {
    expect(needsMetric("X")).toBe(false);
  });

  it("detects performance category", () => {
    expect(detectCategory("Reduced latency by 40%")).toBe("performance");
  });

  it("detects scale category", () => {
    expect(detectCategory("System scales to handle 10k concurrent requests")).toBe("scale");
  });

  it("detects cost category", () => {
    expect(detectCategory("Saved infrastructure cost")).toBe("cost");
  });

  it("detects team category", () => {
    expect(detectCategory("Mentored engineers")).toBe("team");
  });

  it("detects users category", () => {
    expect(detectCategory("Shipped to all customers")).toBe("users");
  });

  it("falls back to generic", () => {
    expect(detectCategory("Wrote documentation")).toBe("generic");
  });

  it("returns a hint per category", () => {
    expect(suggestMetricHint("performance")).toContain("performance");
    expect(suggestMetricHint("cost")).toContain("$");
  });
});
