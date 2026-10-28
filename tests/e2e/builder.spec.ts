import { test, expect } from "@playwright/test";

test.describe("Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should start with an empty resume on first visit", async ({ page }) => {
    await expect(page.locator("input[id='name']")).toHaveValue("");
  });

  test("should not show the quick setup popup", async ({ page }) => {
    await expect(page.locator("text=Quick Setup")).toHaveCount(0);
  });

  test("should have grouped toolbar", async ({ page }) => {
    await expect(page.locator("[aria-label='Editor']")).toBeVisible();
    await expect(page.locator("[aria-label='ATS']")).toBeVisible();
    await expect(page.locator("[aria-label='Export']")).toBeVisible();
  });

  test("should switch panels", async ({ page }) => {
    await page.click("button:has-text('Templates')");
    await expect(page.getByRole("heading", { name: "Template" })).toBeVisible();
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
    await page.click("[aria-label='Hide preview']");
    await expect(page.locator("text=Preview")).not.toBeVisible();
  });

  test("should show version history dialog", async ({ page }) => {
    await page.click("[aria-label='Version history']");
    await expect(page.locator("text=Version History")).toBeVisible();
  });

  test("should navigate home when clicking the SafarCraft logo", async ({ page }) => {
    await page.click("a[aria-label='SafarCraft home']");
    await expect(page).toHaveURL(/\/$/);
  });
});
