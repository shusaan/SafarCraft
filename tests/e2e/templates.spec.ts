import { test, expect } from "@playwright/test";

test.describe("Template gallery", () => {
  test("renders all eight real template previews", async ({ page }) => {
    await page.goto("/templates");
    await expect(page.locator("[data-template-preview]")).toHaveCount(8);
    await expect(page.getByRole("heading", { name: "Classic ATS" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Gengar" })).toBeVisible();
  });

  test("opens the builder with the selected template", async ({ page }) => {
    await page.goto("/templates");
    await page.locator('a[href="/builder?panel=templates&template=gengar"]').click();

    const gengar = page.getByRole("button", { name: /Use the Gengar template/ });
    await expect(gengar).toHaveAttribute("aria-pressed", "true");
  });

  test("template selector supports keyboard selection", async ({ page }) => {
    await page.goto("/builder?panel=templates");
    const executive = page.getByRole("button", { name: /Use the Executive template/ });
    await executive.focus();
    await page.keyboard.press("Enter");
    await expect(executive).toHaveAttribute("aria-pressed", "true");
  });
});
