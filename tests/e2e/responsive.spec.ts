import { test, expect } from "@playwright/test";

test.describe("Responsive Design", () => {
  test("mobile: should show hamburger menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/builder");
    await expect(page.locator("[aria-label='Toggle menu']")).toBeVisible();
  });

  test("mobile: should open mobile menu", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/builder");
    await page.click("[aria-label='Toggle menu']");
    await expect(page.locator("nav[aria-label='Mobile navigation menu']")).toBeVisible();
  });

  test("desktop: should show full toolbar", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/builder");
    await expect(page.locator("nav[aria-label='Builder panels']")).toBeVisible();
  });

  test("desktop: should have resizable preview", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/builder");
    await expect(page.locator("[aria-label='Drag to resize preview']")).toBeVisible();
  });
});
