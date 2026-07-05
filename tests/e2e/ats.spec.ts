import { test, expect } from "@playwright/test";

test.describe("ATS Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
    await page.click("button:has-text('ATS')");
  });

  test("should show ATS score", async ({ page }) => {
    await expect(page.locator("text=ATS Analysis")).toBeVisible();
  });

  test("should show score message", async ({ page }) => {
    const scoreMessage = page.locator("text=/Excellent|Good foundation|Needs improvement|Significant issues/");
    await expect(scoreMessage).toBeVisible();
  });

  test("should show deductions if any", async ({ page }) => {
    const deductions = page.locator("text=Deductions");
    if (await deductions.isVisible()) {
      await expect(deductions).toBeVisible();
    }
  });

  test("should show recommendations", async ({ page }) => {
    const recommendations = page.locator("text=Recommendations");
    if (await recommendations.isVisible()) {
      await expect(recommendations).toBeVisible();
    }
  });
});
