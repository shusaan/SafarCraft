# Contributing to CareerForge AI

Thank you for your interest in contributing! We welcome contributions from everyone.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Run `docker compose up` to start the development environment
4. Create a branch for your changes

## Development Setup

The project uses Docker Compose for local development:

```bash
docker compose up
```

This starts the Next.js app on port 3000 and PostgreSQL on port 5432.

## Code Standards

- TypeScript strict mode
- ESLint + Prettier for formatting
- Vitest for unit tests, Playwright for E2E
- All new features must include tests
- Follow the existing code style

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit the PR

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`

## Code of Conduct

Please read CODE_OF_CONDUCT.md. We expect all contributors to adhere to it.
