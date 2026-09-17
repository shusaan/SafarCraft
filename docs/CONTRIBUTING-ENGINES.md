# Contributing to CareerForge Engines

CareerForge's Smart Helpers are data-driven and easy to extend. No LLM knowledge needed — just add rows to arrays.

## Action Verbs Bank — `src/data/action-verbs.ts`

Add new verbs to the appropriate domain:

```ts
const ENGINEERING: ActionVerb[] = [
  // ...existing
  { verb: "Containerised", domain: "Engineering" },
];
```

Categories: `Engineering`, `Leadership`, `Design`, `Data`, `Product`, `Research`, `Operations`.

## Bullet Patterns Rewriter — `src/engines/rewriter/patterns.ts`

Add new patterns at the top of `REWRITER_PATTERNS` (first match wins):

```ts
{ name: "Was involved in", match: /^was involved in\s+/i, rewrite: "Contributed to " },
```

Each pattern:
- `name`: human-readable label shown in UI
- `match`: regex (case-insensitive, anchored to start)
- `rewrite`: replacement string OR function for dynamic output

## Achievement Templates — `src/engines/rewriter/achievement-templates.ts`

Add to any role's array. Use `X`, `Y`, `Z`, `N`, `M`, `A%`, `B%` placeholders for user-customisable metrics.

```ts
engineering: [
  // ...existing
  "Shipped X to N users, generating $M ARR",
],
```

## Grammar Checker — `src/engines/grammar/checker.ts`

Add to one of the constants:
- `WEASEL_WORDS` — words like "very", "really" that add no meaning
- `CLICHES` — phrases like "think outside the box"
- `WEAK_PHRASES` — verbose phrases that have a shorter equivalent (provide a `tip`)

## Summary Builder — `src/engines/rewriter/summary-builder.ts`

Customise `HOOKS`, `SCALE`, or the main `buildSummary()` template per target company type.

## Cover Letter — `src/engines/rewriter/cover-letter.ts`

Customise the 3-paragraph template. The current one is intentionally generic.

## Writing Tests

Every change must come with tests in `tests/unit/data/` or `tests/unit/engines/`. Use the existing tests as a template — they are short and focused.
