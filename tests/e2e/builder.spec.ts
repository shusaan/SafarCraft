import { test, expect } from "@playwright/test";

test.describe("Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should load sample resume on first visit", async ({ page }) => {
    await expect(page.locator("input[id='name']")).toHaveValue("Alex Johnson");
  });

  test("should show onboarding checklist", async ({ page }) => {
    await expect(page.locator("text=Quick Setup")).toBeVisible();
  });

  test("should have grouped toolbar", async ({ page }) => {
    await expect(page.locator("text=Build")).toBeVisible();
    await expect(page.locator("text=Enhance")).toBeVisible();
    await expect(page.locator("text=Output")).toBeVisible();
  });

  test("should switch panels", async ({ page }) => {
    await page.click("button:has-text('Templates')");
    await expect(page.locator("text=Template Selector")).toBeVisible();
  });

  test("should show keyboard shortcuts help", async ({ page }) => {
    await page.click("[aria-label='Keyboard shortcuts']");
    await expect(page.locator("text=Keyboard Shortcuts")).toBeVisible();
  });

  test("should toggle dark mode", async ({ page }) => {
    await page.click("[aria-label*='Switch to']");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("should toggle preview", async ({ page }) => {
    await page.click("[aria-label='Toggle preview']");
    await expect(page.locator("text=Preview")).not.toBeVisible();
  });

  test("should show version history dialog", async ({ page }) => {
    await page.click("[aria-label='Version history']");
    await expect(page.locator("text=Version History")).toBeVisible();
  });

  test("should show resume list dialog", async ({ page }) => {
    await page.click("[aria-label='Manage resumes']");
    await expect(page.locator("text=Resumes")).toBeVisible();
  });
});
