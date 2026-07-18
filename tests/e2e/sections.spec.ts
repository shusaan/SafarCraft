import { test, expect } from "@playwright/test";

test.describe("Section Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should show contextual subtitles", async ({ page }) => {
    await expect(page.locator("text=Your name and contact info — this appears at the top of your resume")).toBeVisible();
  });

  test("should navigate to Experience section", async ({ page }) => {
    await page.click("[aria-label='Experience']");
    await expect(page.locator("text=Work history in reverse-chronological order")).toBeVisible();
  });

  test("should navigate to Education section", async ({ page }) => {
    await page.click("[aria-label='Education']");
    await expect(page.locator("text=Degrees, certifications, and academic achievements")).toBeVisible();
  });

  test("should navigate to Skills section", async ({ page }) => {
    await page.click("[aria-label='Skills']");
    await expect(page.locator("text=Technical and soft skills grouped by category")).toBeVisible();
  });
});
