import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { WizardWelcomeSheet } from "@/components/builder/wizard-welcome-sheet";

const { useRouterMock, useSearchParamsMock, usePathnameMock, sp } = vi.hoisted(() => {
  function spFn(s: string): ReadonlyURLSearchParams {
    return new URLSearchParams(s) as unknown as ReadonlyURLSearchParams;
  }
  return {
    sp: spFn,
    useRouterMock: vi.fn(() => ({ replace: vi.fn(), push: vi.fn(), refresh: vi.fn() })),
    useSearchParamsMock: vi.fn(() => spFn("welcome=1&seed=wizard")),
    usePathnameMock: vi.fn(() => "/builder"),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
  useSearchParams: useSearchParamsMock,
  usePathname: usePathnameMock,
}));
vi.mock("@/engines/analytics", () => ({ trackEvent: vi.fn() }));

describe("WizardWelcomeSheet", () => {
  it("renders the celebration copy when ?welcome=1&seed=wizard is set", () => {
    render(<WizardWelcomeSheet />);
    expect(screen.getByText(/Your resume is ready\./)).toBeTruthy();
    expect(screen.getByRole("dialog", { name: /Welcome to the builder/ })).toBeTruthy();
  });

  it("does NOT render for other paths (?seed=other)", () => {
    useSearchParamsMock.mockReturnValue(sp("welcome=1&seed=other"));
    render(<WizardWelcomeSheet />);
    expect(screen.queryByRole("dialog", { name: /Welcome to the builder/ })).toBeNull();
  });

  it("does NOT render when welcome param is missing", () => {
    useSearchParamsMock.mockReturnValue(sp(""));
    render(<WizardWelcomeSheet />);
    expect(screen.queryByRole("dialog", { name: /Welcome to the builder/ })).toBeNull();
  });

  it("'Dismiss' button strips welcome/seed and calls router.replace", async () => {
    const router = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
    useRouterMock.mockReturnValue(router as never);
    useSearchParamsMock.mockReturnValue(sp("welcome=1&seed=wizard&tab=personal"));
    const user = userEvent.setup();
    render(<WizardWelcomeSheet />);
    await user.click(screen.getByRole("button", { name: /Dismiss/ }));
    const calledWith = router.replace.mock.calls[0]?.[0] as string | undefined;
    expect(calledWith).toMatch(/tab=personal/);
    expect(calledWith).not.toMatch(/welcome=/);
  });
});
