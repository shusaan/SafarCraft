import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("home page has no violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("builder page has no violations", async ({ page }) => {
    await page.goto("/builder");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("builder has proper landmarks", async ({ page }) => {
    await page.goto("/builder");
    await expect(page.locator("[role='main']")).toBeVisible();
    await expect(page.locator("[role='navigation']")).toBeVisible();
    await expect(page.locator("[role='complementary']")).toBeVisible();
  });

  test("builder has aria-labels on icon buttons", async ({ page }) => {
    await page.goto("/builder");
    await expect(page.locator("[aria-label='Undo']")).toBeVisible();
    await expect(page.locator("[aria-label='Redo']")).toBeVisible();
    await expect(page.locator("[aria-label='Toggle preview']")).toBeVisible();
  });

  test("keyboard shortcuts dialog is accessible", async ({ page }) => {
    await page.goto("/builder");
    await page.click("[aria-label='Keyboard shortcuts']");
    await expect(page.locator("text=Keyboard Shortcuts")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("text=Keyboard Shortcuts")).not.toBeVisible();
  });
});
