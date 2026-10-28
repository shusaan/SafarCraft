import { test, expect } from "@playwright/test";

test.describe("Export Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
    await page.click("button:has-text('Export')");
  });

  test("should show export formats with descriptions", async ({ page }) => {
    await expect(page.getByText("PDF", { exact: true })).toBeVisible();
    await expect(page.getByText("DOCX", { exact: true })).toBeVisible();
    await expect(page.getByText("Markdown", { exact: true })).toBeVisible();
  });

  test("should show use case descriptions", async ({ page }) => {
    await expect(page.getByText(/Opens your browser's print dialog/i)).toBeVisible();
    await expect(page.getByText(/Best for: Editing in Word/i)).toBeVisible();
  });

  test("should show ATS compliance note", async ({ page }) => {
    await expect(page.locator("text=ATS-compliant")).toBeVisible();
  });
});
