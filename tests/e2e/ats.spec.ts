import { test, expect } from "@playwright/test";

test.describe("ATS Panel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
    await page.click("button:has-text('ATS')");
  });

  test("should show ATS score", async ({ page }) => {
    await expect(page.locator("text=ATS Analysis")).toBeVisible();
  });

  test("should show score message", async ({ page }) => {
    const scoreMessage = page.getByText(/Strong match|Competitive|Needs targeting|High risk|Strong foundation|Solid|Needs work/);
    await expect(scoreMessage).toBeVisible();
  });

  test("should show readiness suggestions", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Suggestions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Resume readiness" })).toBeVisible();
  });

  test("should show the export parse check", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Export parse check" })).toBeVisible();
  });
});
