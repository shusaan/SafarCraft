import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("clearly told");
  });

  test("should show the free-use badge", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText(/No account required/i).first(),
    ).toBeVisible();
  });

  test("should navigate from a primary CTA to onboarding", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Build a resume/i }).first().click();
    await expect(page).toHaveURL(/\/(builder|onboarding)/);
  });

  test("should show qualitative trust strip", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Private by default"),
    ).toBeVisible();
    await expect(
      page.getByText("PDF, DOCX, and JSON exports"),
    ).toBeVisible();
  });

  test("should show a single free pricing card with no paid tier", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Everything is free.")).toBeVisible();
    await expect(page.getByText(/\$5/)).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("should show the editor preview in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByLabel("Illustrative resume editor preview"),
    ).toBeVisible();
  });
});
