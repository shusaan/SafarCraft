# SafarCraft

> Free, open-source resume builder for software engineers.
> Local-first, private by default, 100% free.

![GitHub License](https://img.shields.io/github/license/shusaan/CareerForge-AI)
![GitHub Stars](https://img.shields.io/github/stars/shusaan/CareerForge-AI)

*Safar (سفر) means "journey" in Urdu. SafarCraft helps you craft the next step of yours.*

## Screenshots

> *Screenshots coming soon — run locally to see the platform in action.*

| Builder | ATS Analysis | Smart Helpers |
|---------|-------------|--------------|
| ![Builder](public/screenshots/builder.png) | ![ATS](public/screenshots/ats.png) | ![Quick Actions](public/screenshots/quick-actions.png) |

## Features

- **Smart Resume Builder** — Real-time editing, drag-and-drop, autosave, undo/redo, version history
- **5-Axis ATS Guidance** — Content, Format, ATS, Brevity, Impact checks with per-deduction explanations (guidance to review, not a hiring guarantee)
- **Smart Local Helpers** — Action-verb swap, bullet rewriter, metric prompter, achievement templates, grammar checker (fully offline, no API key)
- **GitHub Intelligence** — Import your GitHub profile, auto-generate contribution bullets
- **Job Description Tailoring** — Compare resume vs JD, find missing keywords, get rephrasing suggestions
- **Snippet Library** — Save & reuse bullet snippets across resumes
- **Insights Dashboard** — Bullet-length distribution, verb distribution, ATS-history charts
- **Multiple Templates** — 8 free templates including Classic ATS, Modern Professional, Executive (column/picture options)
- **Export** — PDF, DOCX, JSON Resume, Markdown, plain TXT
- **Portfolio Generator** — Personal website, GitHub README, professional bio
- **Offline-First PWA** — Install to home screen, edits work without network
- **Privacy First** — No signup required, local-first, users own their data
- **Optional Cloud Sync** — Self-hosted Postgres + Better Auth for multi-device sync
- **Onboarding** — Sample resume, guided checklist, contextual empty states

## Why SafarCraft?

- **100% local** — All smart helpers run in your browser. No API keys, no required telemetry, no data leaves your device.
- **Open source** — MIT licensed, self-hostable with Docker.
- **Engineer-first** — Built around the real workflow of software engineers applying for jobs.
- **Private by default** — Your resume text never touches our servers.

## Tech Stack

Next.js 15 | React 19 | TypeScript | TailwindCSS | shadcn/ui | Zustand | Optional PostgreSQL | PWA

## Quick Start

```bash
# Clone the repository
git clone https://github.com/shusaan/CareerForge-AI.git
cd CareerForge-AI

# Start with Docker (no database required)
docker compose up app

# Open http://localhost:3000
```

No signup required — you're editing a sample resume within seconds.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open http://localhost:3000
```

### Optional: PostgreSQL for Cloud Sync

```bash
# Start with PostgreSQL
docker compose --profile with-db up

# Or set DATABASE_URL in .env
DATABASE_URL=postgresql://user:pass@localhost:5432/careerforge
```

### Optional: Google Drive Export

```bash
# .env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Testing

```bash
# Unit tests
npm run test:run

# E2E tests
npm run test:e2e

# Type checking
npm run typecheck

# Linting
npm run lint
```

## Project Structure

```
src/
  app/         # Next.js App Router pages
  components/  # UI + feature components
  engines/     # ATS, CV parsing, Export, GitHub, Smart Helpers
  data/        # Curated data: action verbs, role skills, achievement templates
  stores/      # Zustand state management
  types/       # TypeScript type definitions
  lib/         # Shared utilities
  hooks/       # React hooks
  i18n/        # Translation strings (en.json + community contributions)
worker/        # Cloudflare Worker (visitor counter)
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/CONTRIBUTING-ENGINES.md](docs/CONTRIBUTING-ENGINES.md) for how to add new action verbs, rewriter patterns, or achievement templates.

## Pricing

There is no paid tier. SafarCraft is free under the MIT license — every feature is available to everyone, and the whole builder works offline. If a paid option is ever added, the core builder will stay free and this README will say exactly what changed.

## License

MIT — free to use, modify, and distribute.

## Support

- Star the repository
- Open an issue for bugs/features
- Contribute via pull requests
