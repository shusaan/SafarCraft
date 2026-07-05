import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("CareerForge AI");
  });

  test("should show no signup required badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=No signup required")).toBeVisible();
  });

  test("should navigate to builder", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Start Building");
    await expect(page).toHaveURL(/\/builder/);
  });

  test("should show visitor counter", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=visitors")).toBeVisible();
  });
});
