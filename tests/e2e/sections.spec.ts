import { test, expect } from "@playwright/test";

test.describe("Section Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
    await expect(page.locator("h2", { hasText: "Sections" })).toBeVisible();
  });

  test("should show contextual subtitles", async ({ page }) => {
    await expect(page.locator("text=Your name and contact info — this appears at the top of your resume")).toBeVisible();
  });

  test("should navigate to Experience section", async ({ page }) => {
    await page.locator('[aria-label="Experience"]').click();
    await expect(page.locator("text=Work history in reverse-chronological order")).toBeVisible();
  });

  test("should navigate to Education section", async ({ page }) => {
    await page.locator('[aria-label="Education"]').click();
    await expect(page.locator("text=Degrees, certifications, and academic achievements")).toBeVisible();
  });

  test("should navigate to Skills section", async ({ page }) => {
    const skillsNav = page.locator('[aria-label="Skills"]');
    await expect(skillsNav).toBeVisible();
    await skillsNav.click();
    await expect(page.locator("text=Technical and soft skills grouped by category")).toBeVisible();
  });
});
