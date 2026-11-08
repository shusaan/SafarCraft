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

test.describe("Builder mobile usability", () => {
  test("mobile: every editable section is reachable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/builder");

    const tablist = page.locator("[role='tablist'][aria-label='Resume sections']");
    await expect(tablist).toBeVisible();

    const tabs = tablist.getByRole("tab");
    await expect(tabs).toHaveCount(7);

    for (const label of [
      "Personal Info", "Experience", "Education", "Skills",
      "Certifications", "Projects", "Languages",
    ]) {
      await expect(tablist.getByRole("tab", { name: label })).toBeAttached();
    }

    const skillsTab = tablist.getByRole("tab", { name: "Skills" });
    await skillsTab.scrollIntoViewIfNeeded();
    await skillsTab.click();
    await expect(skillsTab).toHaveAttribute("aria-selected", "true");
  });

  test("mobile: preview scales to fit the viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/builder");

    // The floating action button is the second "Show preview" control
    // (the header toggle is hidden/ambiguous on mobile).
    await page.getByRole("button", { name: "Show preview" }).last().click();
    const doc = page.locator("[aria-label='Resume document']");
    await expect(doc).toBeVisible();

    const box = await doc.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test("mobile: header does not force horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/builder");

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
