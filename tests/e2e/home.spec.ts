import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display the headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("clearly told");
  });

  test("should show the free-use badge", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/No account required/i).first()).toBeVisible();
  });

  test("should navigate from a primary CTA to onboarding", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("link", { name: /Build a resume/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/(builder|onboarding)/);
  });

  test("should show qualitative trust strip", async ({ page }) => {
    await page.goto("/");
    const strip = page.locator("ul[aria-label='Trust signals']");
    await expect(strip.getByText("Private by default")).toBeVisible();
    await expect(strip.getByText("PDF, DOCX, and JSON exports")).toBeVisible();
  });

  test("should show a single free pricing card with no paid tier", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Everything is free.")).toBeVisible();
    await expect(page.getByText(/\$5/)).toHaveCount(0);
    await expect(page.getByText(/Coming soon/i)).toHaveCount(0);
  });

  test("should show the editor preview in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel("Illustrative resume editor preview")).toBeVisible();
  });

  test("should emit valid organization JSON-LD", async ({ page }) => {
    await page.goto("/");
    const schema = await page
      .locator('head script[type="application/ld+json"]')
      .first()
      .textContent();
    const parsed = JSON.parse(schema ?? "");

    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed.__html).toBeUndefined();
    const types = (parsed["@graph"] as Array<{ "@type": string }>).map((node) => node["@type"]);
    expect(types).toContain("Organization");
    expect(types).toContain("WebApplication");
  });

  test("should show the home FAQ and emit FAQ schema", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Free CV maker and resume builder questions/i,
      }),
    ).toBeVisible();
    await expect(page.getByText("Is SafarCraft really free?")).toBeVisible();

    const schemas = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((elements) => elements.map((element) => element.textContent ?? ""));
    const faqSchema = schemas
      .map((schema) => JSON.parse(schema))
      .find((schema) => schema["@type"] === "FAQPage");

    expect(faqSchema).toBeDefined();
    expect(faqSchema.mainEntity.length).toBeGreaterThan(0);
  });
});
