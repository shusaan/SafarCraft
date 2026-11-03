import { test, expect } from "@playwright/test";

test.describe("Onboarding routes", () => {
  test("hero import CTA goes straight to the builder import flow", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Import a resume/i }).click();
    await expect(page).toHaveURL(/\/builder\?onboarding=import/);
    await expect(page.getByTestId("cv-file-input")).toBeAttached();
  });

  test("legacy import URL redirects to the builder import flow", async ({ page }) => {
    await page.goto("/onboarding?path=import");
    await expect(page).toHaveURL(/\/builder/, { timeout: 10000 });
    await expect(page.getByTestId("cv-file-input")).toBeAttached();
    await expect.poll(() => new URL(page.url()).search).not.toContain("path=import");
  });

  test("legacy scratch URL redirects to the wizard", async ({ page }) => {
    await page.goto("/onboarding?path=scratch");
    await expect(page).toHaveURL(/\/onboarding\/wizard/);
  });

  test("generic onboarding CTA keeps the two-card chooser", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Build a resume/i }).first().click();
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByText("Import your existing CV")).toBeVisible();
  });
});
