import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("ATS-friendly");
    await expect(page.locator("h1")).toContainText("resume");
  });

  test("should show the trust badge", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/No signup/i).first(),
    ).toBeVisible();
  });

  test("should navigate from a primary CTA to onboarding", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Start for free/i }).first().click();
    await expect(page).toHaveURL(/\/(builder|onboarding)/);
  });

  test("should show qualitative trust strip", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Your data stays in your browser"),
    ).toBeVisible();
    // 'Export PDF, DOCX, JSON Resume' is unique to the Hero trust strip
    // (the same phrase doesn't appear elsewhere on the landing page)
    await expect(
      page.getByText("Export PDF, DOCX, JSON Resume"),
    ).toBeVisible();
  });
});
