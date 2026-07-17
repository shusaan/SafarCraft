# E2E Testing Guide

## Overview

This guide covers running and writing end-to-end tests for CareerForge AI.

## Setup

### Option 1: Local Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

### Option 2: Docker Setup

```bash
# Build and run with Docker Compose (no database required)
docker compose up app

# Or build the production image
docker build -t careerforge .
docker run -p 3000:3000 careerforge
```

## Running Tests

### Local

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/e2e/builder.spec.ts

# Run specific test
npx playwright test -g "should load sample resume"

# Run with headed browser (see the browser)
npx playwright test --headed

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Docker

```bash
# Run tests against Docker container
docker compose up -d app
sleep 5  # Wait for app to start
npx playwright test
docker compose down

# Run tests in Docker (Docker-in-Docker)
docker compose --profile test up test
```

### Docker Compose Profiles

```bash
# App only (default — no database)
docker compose up app

# App + PostgreSQL (for cloud sync features)
docker compose --profile with-db up

# Run all services
docker compose --profile with-db --profile test up
```

## Docker Commands Reference

### Development

```bash
# Start dev server with hot reload
docker compose up app

# Rebuild after dependency changes
docker compose up --build app

# View logs
docker compose logs -f app

# Stop all containers
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Production

```bash
# Build production image
docker build -t careerforge:latest .

# Run production container
docker run -d \
  --name careerforge \
  -p 3000:3000 \
  -e NODE_ENV=production \
  careerforge:latest

# View production logs
docker logs -f careerforge

# Stop production container
docker stop careerforge
```

### With Database

```bash
# Start app + PostgreSQL
docker compose --profile with-db up -d

# Run database migrations
docker compose exec app npx drizzle-kit push

# Access PostgreSQL
docker compose exec db psql -U postgres -d careerforge

# Stop everything
docker compose --profile with-db down
```

## Test Structure

```
tests/
├── e2e/
│   ├── home.spec.ts         # Landing page tests
│   ├── builder.spec.ts      # Builder UI tests
│   ├── sections.spec.ts     # Section navigation tests
│   ├── export.spec.ts       # Export panel tests
│   ├── ats.spec.ts          # ATS analysis tests
│   └── responsive.spec.ts   # Mobile/responsive tests
├── accessibility/
│   └── a11y.spec.ts         # Accessibility tests (axe-core)
└── unit/
    └── engines/             # Unit tests for engines
```

## Test Categories

### 1. Home Page Tests (`home.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Title display | H1 contains "CareerForge AI" |
| No signup badge | "No signup required" is visible |
| Navigation | "Start Building" goes to /builder |
| Visitor counter | Visitor badge is visible |

### 2. Builder Tests (`builder.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Sample resume | Alex Johnson is pre-filled |
| Onboarding | "Quick Setup" checklist visible |
| Grouped toolbar | Build/Enhance/Output groups |
| Panel switching | Click Templates shows template selector |
| Shortcuts help | ? button shows shortcuts dialog |
| Dark mode | Toggle switches theme |
| Preview toggle | Eye button hides preview |
| Version history | History button shows dialog |
| Resume list | Resumes button shows dialog |

### 3. Section Tests (`sections.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Contextual subtitles | Each section has unique help text |
| Section navigation | Clicking sections shows correct content |

### 4. Export Tests (`export.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Format list | PDF, DOCX, JSON, Markdown visible |
| Use cases | "Best for:" descriptions shown |
| ATS note | "ATS-compliant" text visible |

### 5. ATS Tests (`ats.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Score display | ATS Analysis heading visible |
| Score message | Contextual message (Excellent/Good/etc) |
| Deductions | Shown if any exist |
| Recommendations | Shown if any exist |

### 6. Responsive Tests (`responsive.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Mobile menu | Hamburger visible on 375px |
| Mobile menu opens | Click hamburger shows menu |
| Desktop toolbar | Full toolbar on 1280px |
| Resize handle | Drag handle visible on desktop |

### 7. Accessibility Tests (`a11y.spec.ts`)

| Test | What it verifies |
|------|-----------------|
| Home page a11y | No axe-core violations |
| Builder page a11y | No axe-core violations |
| Landmarks | main, navigation, complementary |
| ARIA labels | Icon buttons have labels |
| Keyboard shortcuts | Dialog opens/closes with keyboard |

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from "@playwright/test";

test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/builder");
  });

  test("should do something", async ({ page }) => {
    // Arrange
    await page.click("button:has-text('Action')");

    // Act
    await expect(page.locator("text=Expected")).toBeVisible();
  });
});
```

### Common Selectors

```typescript
// By text
page.locator("text=Exact Text")
page.locator("text=/Regex Pattern/")

// By role
page.locator("button:has-text('Label')")
page.locator("input[id='name']")

// By aria
page.locator("[aria-label='Undo']")
page.locator("[aria-pressed='true']")
page.locator("[role='main']")

// By test id
page.locator("[data-testid='my-element']")

// Chaining
page.locator("button").filter({ hasText: "Export" })
```

### Waiting for Elements

```typescript
// Wait for visible
await expect(page.locator("text=Loaded")).toBeVisible();

// Wait for hidden
await expect(page.locator("text=Loading")).not.toBeVisible();

// Wait for URL
await expect(page).toHaveURL(/\/builder/);

// Wait for value
await expect(page.locator("input")).toHaveValue("text");
```

### Mobile Testing

```typescript
test("mobile test", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/builder");
  // Test mobile-specific behavior
});
```

## Debugging

```bash
# Run with debug mode
npx playwright test --debug

# Run with UI mode (best for debugging)
npx playwright test --ui

# Show browser during test
npx playwright test --headed

# Trace test execution
npx playwright test --trace on

# View trace report
npx playwright show-trace trace.zip

# Debug in Docker
docker compose exec app npx playwright test --debug
```

## CI Integration

Tests run automatically in GitHub Actions:

```yaml
# .github/workflows/ci.yml
e2e:
  timeout-minutes: 15
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: npm
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run test:e2e
```

## Dockerfile Reference

### Development (`Dockerfile.dev`)

- Based on `node:26.4.0-alpine3.24`
- Installs dependencies with `--legacy-peer-deps`
- Runs `npm run dev` with hot reload
- Mounts source code as volume for live editing

### Production (`Dockerfile`)

- Multi-stage build for smaller image size
- Stage 1: Install dependencies
- Stage 2: Build Next.js app
- Stage 3: Production runner with minimal footprint
- Runs as non-root user (nextjs:nodejs)
- Exposes port 3000

### Docker Compose Services

| Service | Description | Port |
|---------|-------------|------|
| `app` | Next.js application (dev mode) | 3000 |
| `db` | PostgreSQL 16 (optional) | 5432 |

### Docker Compose Profiles

| Profile | Services | Use Case |
|---------|----------|----------|
| (default) | app | Local development, no database |
| `with-db` | app, db | Development with PostgreSQL |
| `test` | app, test-runner | Running E2E tests in Docker |

## Best Practices

1. **Use data-testid for critical elements** — avoids breaking on text changes
2. **Test user journeys, not implementation** — test what users do, not how it's built
3. **Keep tests independent** — each test should work in isolation
4. **Use beforeEach for setup** — navigate to the right page once
5. **Test accessibility** — run axe-core on every page
6. **Test responsive** — verify mobile and desktop layouts
7. **Use descriptive test names** — "should show error when username is invalid"
8. **Use Docker for consistent environments** — same setup locally and in CI
9. **Clean up after tests** — stop containers to free resources
