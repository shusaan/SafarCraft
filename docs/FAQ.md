# Frequently Asked Questions

## Is CareerForge really 100% free?

Yes. MIT licensed. No paid tier, no upsells, no "Pro" features behind a paywall.

## Does it work offline?

Yes — install it as a PWA (browser will prompt) and your edits work without network. Resume data lives in localStorage.

## Do you store my resume on your servers?

No. By default, your data stays in your browser. The optional cloud-sync profile (`docker compose --profile with-db up`) only stores data if you explicitly self-host the database.

## How does the ATS scoring work?

Pure rules engine — no LLM. We check for:
- Quantified achievements (bullets with numbers)
- Strong action verbs (no "worked on", "was responsible for", etc.)
- Section completeness (name, email, summary, experience, education, skills)
- Bullet length distribution (aim 50–200 chars)
- Contact methods (3+ recommended)

## Why no AI anymore?

We removed the OpenAI dependency in v0.2.0. All Smart Helpers are 100% local:
- Verb Swap: 250+ curated verbs across 7 domains
- Bullet Rewriter: 20+ declarative patterns
- Quantifier: category-specific metric suggestions
- Achievements: 60+ role-aware templates
- Grammar: pure regex weasel/cliché/weak-phrase detection

Local-first means zero cost, zero latency, zero data leakage, and works offline.

## How do I self-host?

```bash
docker compose up app --build
```

Or with PostgreSQL for multi-device sync:

```bash
docker compose --profile with-db up --build
```

Set `BETTER_AUTH_SECRET` in `.env` for auth.

## Can I export to JSON Resume schema?

Yes — there's an export to the [jsonresume.org](https://jsonresume.org) v1.0.0 schema. Choose "JSON" in the Export panel.

## How do I add a new template?

Templates live in `src/engines/templates/`. Implement the `TemplateRenderer` interface (see `registry.tsx`) and register your template. Add a screenshot to `public/screenshots/`.

## How do I add a new language?

See [CONTRIBUTING-i18n.md](CONTRIBUTING-i18n.md).
