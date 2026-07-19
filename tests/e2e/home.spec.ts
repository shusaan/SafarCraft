import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the title", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Free AI CV Maker");
  });

  test("should show no signup required badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=No signup required")).toBeVisible();
  });

  test("should navigate to builder", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Start building free");
    await expect(page).toHaveURL(/\/builder/);
  });

  test("should show trust bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("section[aria-label='Trust signals']")).toBeVisible();
  });
});
