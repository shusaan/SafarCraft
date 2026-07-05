import { test, expect } from "@playwright/test";

test.describe("Section Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should show contextual subtitles", async ({ page }) => {
    await expect(page.locator("text=Start with your name and contact info")).toBeVisible();
  });

  test("should navigate to Experience section", async ({ page }) => {
    await page.click("text=Experience");
    await expect(page.locator("text=Add your work history")).toBeVisible();
  });

  test("should navigate to Education section", async ({ page }) => {
    await page.click("text=Education");
    await expect(page.locator("text=Add your degrees")).toBeVisible();
  });

  test("should navigate to Skills section", async ({ page }) => {
    await page.click("text=Skills");
    await expect(page.locator("text=Highlight your technical")).toBeVisible();
  });
});
