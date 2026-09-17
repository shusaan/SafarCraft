import { describe, it, expect } from "vitest";
import { t, setLocale, listAvailableLocales, getLocale } from "@/i18n";

describe("i18n", () => {
  it("returns translated string", () => {
    expect(t("app.title")).toBe("CareerForge AI");
  });

  it("returns key when translation is missing", () => {
    expect(t("nonexistent.key")).toBe("nonexistent.key");
  });

  it("supports locale switching", () => {
    setLocale("en");
    expect(getLocale()).toBe("en");
  });

  it("lists available locales", () => {
    const locales = listAvailableLocales();
    expect(locales).toContain("en");
  });
});
