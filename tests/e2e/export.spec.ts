import { test, expect } from "@playwright/test";

test.describe("Export Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
    await page.click("button:has-text('Export')");
  });

  test("should show export formats with descriptions", async ({ page }) => {
    await expect(page.locator("text=PDF")).toBeVisible();
    await expect(page.locator("text=DOCX")).toBeVisible();
    await expect(page.locator("text=JSON Resume")).toBeVisible();
    await expect(page.locator("text=Markdown")).toBeVisible();
  });

  test("should show use case descriptions", async ({ page }) => {
    await expect(page.locator("text=Best for: Submitting to employers")).toBeVisible();
  });

  test("should show ATS compliance note", async ({ page }) => {
    await expect(page.locator("text=ATS-compliant")).toBeVisible();
  });
});
