# Contributing to CareerForge AI

Thank you for your interest in contributing! We welcome contributions from everyone.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev` (or `docker compose up app` for Docker)
5. Create a branch for your changes

## Development Setup

```bash
# Node 22 LTS (see .nvmrc)
nvm use
npm install
npm run dev
```

Or with Docker:

```bash
docker compose up app --build
```

This starts the Next.js app on port 3000. PostgreSQL is opt-in via `docker compose --profile with-db up`.

## Code Standards

- TypeScript strict mode
- ESLint + Prettier for formatting
- Vitest for unit tests, Playwright for E2E
- All new features must include tests
- Follow existing code style
- 100% local-first — no new API keys or external services without strong justification

## Adding to Smart Helpers

See [docs/CONTRIBUTING-ENGINES.md](docs/CONTRIBUTING-ENGINES.md) for how to add:
- New action verbs (`src/data/action-verbs.ts`)
- New rewriter patterns (`src/engines/rewriter/patterns.ts`)
- New achievement templates (`src/engines/rewriter/achievement-templates.ts`)
- New grammar/style rules (`src/engines/grammar/checker.ts`)
- New role-skill matrices for the radar (`src/data/role-skills.ts` — coming soon)

## Translation

See [docs/CONTRIBUTING-i18n.md](docs/CONTRIBUTING-i18n.md) for adding new languages.

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Run all gates: `npm run typecheck && npm run lint && npm run test:run`
4. Submit the PR

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

Release-please picks these up to auto-version and generate CHANGELOG.

## Code of Conduct

Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). We expect all contributors to adhere to it.
