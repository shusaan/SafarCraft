import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAnalytics } from "@/lib/analytics/use-analytics";
import { trackEvent } from "@/engines/analytics";

vi.mock("@/engines/analytics", () => ({
  trackEvent: vi.fn(),
  AnalyticsEvent: undefined,
}));

describe("useAnalytics", () => {
  it("returns a stable callback reference", () => {
    const { result, rerender } = renderHook(() => useAnalytics());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it("delegates to trackEvent with the same event + metadata", () => {
    const { result } = renderHook(() => useAnalytics());
    act(() => result.current("wizard_step_completed", { step: "personal" }));
    expect(trackEvent).toHaveBeenCalledWith("wizard_step_completed", { step: "personal" });
  });
});
