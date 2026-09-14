# Contributing Translations (i18n)

CareerForge ships with English only. Community members can add translations by creating new locale files.

## Add a Language

1. Copy `src/i18n/en.json` to `src/i18n/<lang>.json` (e.g., `es.json`, `fr.json`).
2. Translate every value (don't change the keys).
3. Update `src/i18n/index.ts` — add your locale to the `Locale` type and to `STRINGS`.

```ts
import en from "./en.json";
import es from "./es.json";

type Locale = "en" | "es";

const STRINGS: Record<Locale, Record<string, string>> = {
  en: en as Record<string, string>,
  es: es as Record<string, string>,
};
```

4. Add tests in `tests/unit/i18n.test.ts` if you add new locales.

## Translation Style Guide

- Keep technical terms (ATS, JSON Resume, STAR) in English unless there's a widely-used localised term.
- UI strings should be concise (button labels fit on small screens).
- Use sentence case for messages, title case for headings.

## Open a PR

Create a PR titled `i18n(<lang>): add <Language> translation` and reference the issue (if any).
