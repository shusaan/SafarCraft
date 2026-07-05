# Changelog

## [0.1.0] - 2026-07-03

### Phase 1: Foundation
- Project setup with Next.js 15 + TypeScript
- Docker Compose for local development (Node.js + PostgreSQL)
- Database schema with Drizzle ORM (users, resumes, versions, analytics)
- Zustand state management (resume store, UI store)
- Base UI components (Button, Card, Input, Label, Badge)
- Landing page with feature showcase
- Base layout with metadata and SEO
- ATS types, AI types, GitHub types
- Open source files (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- GitHub Actions CI pipeline
- Issue and PR templates
- Dependabot + Renovate configuration
- Vitest + Playwright test setup

### Phase 2: Resume Builder
- Form sections: Personal Info, Experience, Education, Skills, Certifications, Projects, Languages
- Section sidebar with drag & drop reordering
- Undo/Redo with keyboard shortcuts (Ctrl+Z, Ctrl+Y)
- Autosave (debounced, local-first + API)
- Live preview panel with template engine
- Multiple resume support (create, rename, delete)
- Version history with snapshot API
- Toast notification system
- Theme provider (light/dark/system)

### Phase 3: Templates
- Classic ATS template (1-col, 2-col, picture options)
- Modern Professional template (with accent color, skill tags)
- Executive template (dark header, competency grid)
- Template selector UI with layout controls
- Template rendering engine

### Phase 4: Export Engine
- PDF export (react-pdf, ATS-compliant)
- DOCX export (docx library, formatted)
- JSON Resume export (standard schema)
- Markdown export (clean formatting)
- Export panel UI with format picker
- Unified export engine

### Phase 5: ATS Engine
- ATS scoring (0-100 with deductions)
- Weak verb detection
- Long paragraph detection
- Missing section detection
- Metrics/quantification analysis
- Detailed deduction explanations
- Actionable recommendations
- ATS results UI with score gauge

### Phase 6: AI Engine
- AI prompt system (improve bullet, rewrite summary, grammar, achievements, verbs)
- OpenAI integration (gpt-4o-mini) with local fallback
- AI API route with streaming support
- AI Assistant UI with action selector

### Phase 7: GitHub Intelligence
- GitHub profile fetch (Octokit, API)
- Repository analysis (languages, stars, forks)
- Contribution bullet generation
- Skills extraction from repos
- Project generation from pinned repos
- GitHub import UI with preview

### Phase 8: Job Description Analyzer
- Tech keyword extraction
- Resume comparison algorithm
- Match score calculation
- Missing skills detection
- Keyword heatmap
- Suggestions engine
- JD Analyzer UI

### Phase 9: Portfolio Generator
- Personal website HTML generator
- GitHub Profile README generator
- Short professional bio generator
- Portfolio generator UI with copy/download

### Phase 10: Analytics & Visitor Counter
- Privacy-friendly visitor counter
- Admin analytics page
- Local storage-based visit tracking
- Analytics API structure

### Phase 11: Testing
- Unit tests for ATS Engine
- Unit tests for Export Engine
- Unit tests for GitHub Intelligence
- Playwright E2E tests (home page, navigation)
- Accessibility tests (axe-core)

### Phase 12: Deployment
- Vercel configuration (vercel.json)
- Docker multi-stage build
- Docker Compose for development
- Production-ready configuration
