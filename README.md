# CareerForge AI

> Open-source AI resume platform for software engineers.
> ATS-optimized, GitHub-powered, AI-assisted.

![GitHub License](https://img.shields.io/github/license/yourusername/careerforge-ai)
![GitHub Stars](https://img.shields.io/github/stars/yourusername/careerforge-ai)
![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=yourusername.careerforge-ai)

## Screenshots

> *Screenshots coming soon — run locally to see the platform in action.*

| Builder | ATS Analysis | AI Assistant |
|---------|-------------|--------------|
| ![Builder](public/screenshots/builder.png) | ![ATS](public/screenshots/ats.png) | ![AI](public/screenshots/ai.png) |

## Features

- **Smart Resume Builder** — Real-time editing, drag-and-drop, autosave, undo/redo, version history
- **ATS Analysis** — Detailed scoring with explanations for every deduction
- **AI Assistant** — Improve bullets, rewrite summaries, check grammar, generate verbs
- **GitHub Intelligence** — Import your GitHub profile, auto-generate contribution bullets
- **Job Description Analyzer** — Compare your resume against any job description
- **Multiple Templates** — Classic ATS, Modern Professional, Executive (column/picture options)
- **Export** — PDF, DOCX, JSON Resume, Markdown (ATS compliant)
- **Portfolio Generator** — Personal website, GitHub README, professional bio
- **Privacy First** — No signup required, local-first, users own their data
- **Onboarding** — Sample resume, guided checklist, contextual empty states

## Tech Stack

Next.js 15 | React 19 | TypeScript | TailwindCSS | shadcn/ui | Zustand | Optional PostgreSQL

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/careerforge-ai.git
cd careerforge-ai

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
  engines/     # ATS, Export, AI, GitHub logic
  stores/      # Zustand state management
  types/       # TypeScript type definitions
  lib/         # Shared utilities
  hooks/       # React hooks
worker/        # Cloudflare Worker (visitor counter)
```

## License

MIT — free to use, modify, and distribute.

## Support

- Star the repository
- Open an issue for bugs/features
- Contribute via pull requests
