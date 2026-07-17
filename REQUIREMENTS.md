# CareerForge AI — Requirements & Tasks

> Open-source AI resume platform for software engineers.
> Built as innovation evidence for UK Global Talent visa.

---

## 1. Project Overview

| Property | Value |
|---|---|
| **Name** | CareerForge AI |
| **Type** | Open-source AI Resume Platform |
| **Target Users** | Software Engineers, DevOps, SREs, Cloud Architects, Students |
| **License** | MIT |
| **Deployment** | Vercel / Cloudflare Pages (free tier) |
| **Local Dev** | Docker & Docker Compose |
| **Data Storage** | Local-first (localStorage), optional PostgreSQL for cloud sync |

---

## 2. Goals

- [x] Technical innovation (UK Global Talent evidence)
- [x] Excellent UX — onboarding, progressive disclosure, responsive
- [x] AI integration (optional, with local fallback)
- [x] ATS compliance
- [x] Open-source engineering
- [x] Real-world usefulness
- [x] High maintainability
- [x] Community adoption metrics (visitor counter)

---

## 3. Tech Stack

| Category | Technology |
|---|---|
| **Framework** | Next.js 15 |
| **UI Library** | React 19 |
| **Language** | TypeScript |
| **Styling** | TailwindCSS + shadcn/ui |
| **State Management** | Zustand (localStorage persistence) |
| **Forms** | React Hook Form + Zod |
| **Database** | Optional — Drizzle ORM + PostgreSQL (for cloud sync) |
| **Auth** | Optional — Better Auth (for multi-device) |
| **PDF Export** | react-pdf |
| **DOCX Export** | docx |
| **File Upload** | react-dropzone |
| **GitHub API** | Octokit |
| **AI SDK** | Vercel AI SDK |
| **Testing** | Vitest + Playwright |
| **CI/CD** | GitHub Actions |
| **Container** | Docker + Docker Compose |
| **Visitor Counter** | Cloudflare Worker |

---

## 4. Design Principles

- [x] Minimal — clean, focused interface
- [x] Fast (Lighthouse 95+)
- [x] Responsive — works on all devices
- [x] Accessible (WCAG 2.1 AA)
- [x] Privacy First — no signup required
- [x] Offline Friendly — works without internet
- [x] SEO Friendly (100)
- [x] ATS Friendly
- [x] Progressive Disclosure — reveal complexity gradually
- [x] Best Practices (100)

---

## 5. Features

### 5.1 Resume Builder

- [x] Real-time editing
- [x] Autosave (debounced, localStorage)
- [x] Drag & Drop sections
- [x] Live preview (side-by-side, resizable)
- [x] Undo / Redo
- [x] Multiple resumes
- [x] Version history (2 versions per resume)
- [x] Section management (add, reorder, remove, collapse)
- [x] Pre-filled sample resume for quick start
- [x] Onboarding checklist (3 steps)
- [x] Contextual empty states per section

### 5.2 ATS Engine

- [x] Generate ATS score
- [x] Explain every deduction (not just a number)
- [x] Highlight missing keywords
- [x] Detect weak verbs
- [x] Flag long paragraphs
- [x] Detect formatting issues
- [x] Validate section ordering
- [x] Assess bullet quality
- [x] Show actionable recommendations
- [x] Contextual score messages

### 5.3 AI Resume Assistant

- [x] Improve experience bullets
- [x] Rewrite professional summary
- [x] Grammar & spelling check
- [x] Suggest measurable achievements
- [x] Generate stronger action verbs
- [x] Never fabricate information
- [x] Streaming AI responses
- [x] Local fallback when no API key

### 5.4 Job Description Analyzer

- [x] Paste JD input
- [x] Extract skills, technologies, responsibilities, experience level
- [x] Compare against resume
- [x] Generate resume match score
- [x] List missing skills
- [x] Suggest improvements
- [x] Keyword heatmap visualization

### 5.5 GitHub Intelligence

- [x] Enter GitHub username
- [x] Fetch repositories via Octokit
- [x] Analyze languages, stars, forks, pinned repos, contribution activity
- [x] Auto-generate open source contributions section
- [x] Auto-generate projects section
- [x] Auto-generate technical skills
- [x] Auto-generate achievement bullets

### 5.6 Resume Templates

- [x] Classic ATS
- [x] Modern Professional
- [x] Executive
- [x] Each supports: one column, two column, picture on, picture off
- [x] Dark preview / Light preview toggle

### 5.7 Export

- [x] PDF (selectable text, ATS compliant, clickable links, correct page breaks)
- [x] DOCX
- [x] JSON Resume format
- [x] Markdown
- [x] Export preview before download

### 5.8 Resume Version Comparison

- [x] Compare two versions
- [x] Show added skills
- [x] Show removed skills
- [x] Show changed experience
- [x] Show ATS score improvements
- [x] Git-diff style UI

### 5.9 Portfolio Generator

- [x] Generate personal website page
- [x] Generate developer landing page
- [x] Generate GitHub Profile README
- [x] Generate short professional bio
- [x] All generated from resume data

### 5.10 Privacy

- [x] Everything works locally
- [x] No signup required
- [x] Guest mode supports complete app
- [x] Users own their data
- [x] No telemetry without consent
- [x] Optional cloud sync via PostgreSQL

### 5.11 Visitor Counter

- [x] Visible badge on landing page
- [x] Lifetime total visitors
- [x] Privacy-friendly (no personal data)
- [x] Powered by Cloudflare Worker

### 5.12 UX (2026 Standards)

- [x] Pre-filled sample resume on first visit
- [x] Onboarding checklist (auto-show, dismissable)
- [x] Contextual empty states per section
- [x] Grouped toolbar (Build / Enhance / Output)
- [x] Responsive layout (mobile drawer, overlay preview)
- [x] Resizable preview pane
- [x] Better error messages
- [x] Keyboard shortcuts help
- [x] Accessibility landmarks and ARIA labels
- [x] Reduced motion support

### 5.14 Builder UI — 2026 Polish

- [x] Gradient builder header bar — logo icon, name, autosave status pill
- [x] Panel navigation tabs — active gradient underline indicator, hover scale micro-animation
- [x] Section sidebar — completion status badges (green check when section has data)
- [x] Animated panel transitions — fade-in when switching between panels
- [x] Animated ATS score — SVG circular progress ring with gradient stroke and animated fill
- [x] ATS deduction cards — severity left-border colour coding (red/amber/slate)
- [x] Preview panel header — zoom in/out controls, page count indicator
- [x] Onboarding checklist — gradient progress bar, numbered step circles, glassmorphism card
- [x] Skeleton loaders — shimmer placeholders shown while preview renders
- [x] Button base component — `active:scale-95` micro-press + `transition-transform`

- [x] Custom web font — Geist Sans + Geist Mono (next/font/google)
- [x] Vibrant brand accent — violet/indigo gradient palette injected into CSS theme
- [x] Glassmorphism navigation bar with sticky backdrop-blur
- [x] Animated hero section — staggered entrance animations (fade + slide-up)
- [x] Gradient headline with violet accent on "AI" keyword
- [x] Gradient CTA primary button with subtle glow hover effect
- [x] Hero product mockup card — live visual of the resume builder UI
- [x] Stats bar — GitHub stars, open source badge, no-signup claim
- [x] Feature cards — icon gradient backgrounds, hover lift effect, staggered CSS animation
- [x] How it works — 3-step numbered section with connecting line
- [x] Social proof / open source trust section
- [x] Footer with links, license badge, GitHub link
- [x] Fully responsive — mobile-first layout
- [x] Dark mode compatible throughout

---

## 6. Architecture

```
┌─────────────────────────────────────────────┐
│         Client (localStorage first)          │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Zustand │ │  Persist │ │  Local      │  │
│  │  Store   │ │Middleware│ │  Storage    │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
├─────────────────────────────────────────────┤
│         API Routes (Optional)                │
│  ┌────────┐ ┌────────┐ ┌──────────────────┐ │
│  │ Resume │ │  AI    │ │  GitHub          │ │
│  │ CRUD   │ │ Route  │ │  Proxy          │ │
│  └────────┘ └────────┘ └──────────────────┘ │
│  ┌────────────────────────────────────────┐  │
│  │  DB (Optional — if DATABASE_URL set)   │  │
│  └────────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│         External Services                    │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ OpenAI   │ │ GitHub   │ │ Cloudflare  │  │
│  │ (AI)     │ │ API      │ │ (Visitors)  │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 7. Folder Structure

```
careerforge-ai/
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── public/
├── worker/               # Cloudflare Worker (visitor counter)
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/          (shadcn)
│   │   ├── builder/     (resume builder)
│   │   ├── templates/   (resume templates)
│   │   ├── export/      (export UI)
│   │   ├── ats/         (ATS results)
│   │   ├── ai/          (AI assistant)
│   │   ├── github/      (GitHub import)
│   │   └── shared/
│   ├── engines/
│   │   ├── ats/
│   │   ├── export/
│   │   ├── ai/
│   │   └── github/
│   ├── stores/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
├── tests/
│   ├── unit/
│   ├── e2e/
│   └── accessibility/
├── docker/
├── docs/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── LICENSE
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── ROADMAP.md
├── CHANGELOG.md
├── SECURITY.md
└── README.md
```

---

## 8. Development Phases

### Phase 0: Architectural Simplification

- [x] 0.1 Extract TypeScript types to src/types/resume.ts
- [x] 0.2 Make PostgreSQL optional (app works without it)
- [x] 0.3 Make auth optional (no signup required)
- [x] 0.4 Delete admin page
- [x] 0.5 Keep visitor counter (Cloudflare Worker)
- [x] 0.6 Update docker-compose with profiles
- [x] 0.7 Update store for 2-version limit
- [x] 0.8 Update documentation

### Phase 1: Onboarding & First Experience

- [x] 1.1 Pre-filled sample resume (senior software engineer)
- [x] 1.2 Onboarding checklist (3 steps, auto-show, dismissable)
- [x] 1.3 Contextual empty states per section
- [x] 1.4 Update landing page (no signup gate)

### Phase 2: Simplify the Builder

- [x] 2.1 Group toolbar (Build / Enhance / Output)
- [x] 2.2 Responsive layout (drawer on mobile, overlay preview)
- [x] 2.3 Resizable preview (drag handle)
- [x] 2.4 Better section subtitles

### Phase 3: Trust & Transparency

- [x] 3.1 Better error messages
- [x] 3.2 ATS score context
- [x] 3.3 Export preview
- [x] 3.4 Toast improvements

### Phase 4: Micro-Interactions

- [x] 4.1 Completion celebrations
- [x] 4.2 Smooth transitions
- [x] 4.3 Keyboard shortcuts help

### Phase 5: Accessibility

- [x] 5.1 Landmark elements
- [x] 5.2 Focus management
- [x] 5.3 ARIA labels
- [x] 5.4 Reduced motion

### Phase 6: Core Resume Builder (Completed)

- [x] 6.1 Resume form sections
- [x] 6.2 Drag & drop reordering
- [x] 6.3 Undo/redo
- [x] 6.4 Autosave
- [x] 6.5 Live preview
- [x] 6.6 Multiple resume support
- [x] 6.7 Version history

### Phase 7: Templates (Completed)

- [x] 7.1 Classic ATS template
- [x] 7.2 Modern Professional template
- [x] 7.3 Executive template
- [x] 7.4 Layout options (columns, picture)

### Phase 8: Export Engine (Completed)

- [x] 8.1 PDF export
- [x] 8.2 DOCX export
- [x] 8.3 JSON Resume export
- [x] 8.4 Markdown export

### Phase 9: ATS Engine (Completed)

- [x] 9.1 ATS scoring with deductions
- [x] 9.2 Keyword analysis
- [x] 9.3 Recommendations

### Phase 10: AI Engine (Completed)

- [x] 10.1 AI bullet improvement
- [x] 10.2 Summary rewriting
- [x] 10.3 Grammar checking
- [x] 10.4 Achievement suggestions
- [x] 10.5 Streaming responses

### Phase 11: GitHub Intelligence (Completed)

- [x] 11.1 GitHub profile import
- [x] 11.2 Repository analysis
- [x] 11.3 Auto-generated contributions

### Phase 12: Job Description Analyzer (Completed)

- [x] 12.1 JD input and parsing
- [x] 12.2 Match scoring
- [x] 12.3 Keyword heatmap

### Phase 13: Portfolio & Comparison (Completed)

- [x] 13.1 Version comparison (git-diff style)
- [x] 13.2 Personal website generator
- [x] 13.3 Landing page generator
- [x] 13.4 GitHub README generator
- [x] 13.5 Short bio generator

### Phase 14: Testing

- [x] 14.1 Vitest unit tests (engines)
- [ ] 14.2 Component tests
- [ ] 14.3 Playwright E2E tests
- [ ] 14.4 Accessibility tests (axe-core)

### Phase 15: 2026 Landing Page Redesign

- [x] 15.1 Add Geist Sans + Geist Mono via next/font/google
- [x] 15.2 Add violet/indigo brand gradient to CSS theme tokens
- [x] 15.3 Glassmorphism sticky nav with backdrop-blur
- [x] 15.4 Animated hero — fade/slide entrance with stagger
- [x] 15.5 Gradient CTA button with glow hover
- [x] 15.6 Hero product mockup card
- [x] 15.7 Stats trust bar (stars, open source, no-signup)
- [x] 15.8 Feature cards grid with gradient icons + hover lift
- [x] 15.9 How it works — 3-step section
- [x] 15.10 Open source trust section
- [x] 15.11 Rich footer with links and badges
- [x] 15.12 Full dark mode support across all new sections

### Phase 17: 2026 Builder UI Polish

- [x] 17.1 Gradient builder header with logo + brand identity
- [x] 17.2 Autosave status animated pill (saving → saved → unsaved)
- [x] 17.3 Panel nav tabs — active gradient underline + hover scale
- [x] 17.4 Section sidebar — per-section completion status badges
- [x] 17.5 Animated panel fade-in transitions on panel swap
- [x] 17.6 ATS animated circular SVG progress ring
- [x] 17.7 ATS deduction cards — severity left-border colour system
- [x] 17.8 Preview header zoom controls (50%–150%)
- [x] 17.9 Onboarding checklist — glassmorphism card, gradient bar, numbered circles
- [x] 17.10 Skeleton loader shimmer for preview panel
- [x] 17.11 Button active:scale-95 + transition-transform micro-press

### Phase 16: Deployment

- [x] 16.1 Vercel config
- [x] 16.2 Docker multi-stage build
- [ ] 16.3 Deploy visitor counter (Cloudflare Worker)
- [ ] 16.4 Verify Lighthouse scores

---

## 9. Open Source Quality

- [x] MIT License
- [x] README with screenshots, demo link, visitor counter badge
- [x] Architecture Diagram
- [x] Contribution Guide
- [x] Issue Templates (bug, feature, question)
- [x] Pull Request Template
- [x] Code of Conduct
- [x] Roadmap
- [x] Changelog
- [x] GitHub Actions CI
- [x] Docker Support
- [x] Dev Container
- [x] Dependabot
- [x] Renovate

---

## 10. Performance Targets

| Metric | Target |
|---|---|
| **Lighthouse Performance** | 95+ |
| **Lighthouse Accessibility** | 100 |
| **Lighthouse Best Practices** | 100 |
| **Lighthouse SEO** | 100 |

---

## 11. Testing Strategy

| Type | Tool | Scope |
|---|---|---|
| **Unit** | Vitest | Engines, utils, stores, hooks |
| **Component** | Vitest + Testing Library | UI components |
| **E2E** | Playwright | Critical user flows |
| **Accessibility** | axe-core Playwright | All pages |
| **Performance** | Lighthouse CI | Production build |

---

## 12. Docker Setup

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"

  # Optional: Run with PostgreSQL for cloud sync
  # docker compose --profile with-db up
  db:
    image: postgres:16-alpine
    profiles:
      - with-db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=careerforge
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

## 13. Notes

- No signup required — full app works without authentication.
- All data stored in localStorage — users own their data.
- PostgreSQL is optional — enables cloud sync when configured.
- AI features work with local prompts as fallback (no API key needed).
- Visitor counter uses Cloudflare Worker (free tier).
- Articles about this project (written externally) + visitor counter = UK Global Talent evidence.
- No paid services required at any point.
