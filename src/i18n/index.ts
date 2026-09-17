/**
 * i18n stub — single-language (English) for now.
 * Translators: copy src/i18n/en.json to src/i18n/<lang>.json, translate, then load it via setLocale().
 */

import en from "./en.json";

type Locale = "en";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
};

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string): string {
  const dict = STRINGS[currentLocale];
  if (!dict) return key;
  return dict[key] ?? key;
}

export function listAvailableLocales(): Locale[] {
  return Object.keys(STRINGS) as Locale[];
}
