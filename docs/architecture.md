# Architecture

## Overview

```
┌─────────────────────────────────────────────┐
│         Client (localStorage first)          │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │  Zustand │ │  Persist │ │  Local      │  │
│  │  Store   │ │Middleware│ │  Storage    │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
├─────────────────────────────────────────────┤
│         Engines (100% local)                 │
│  ┌────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  ATS   │ │ CV Parse │ │ Smart Helpers │  │
│  │ Engine │ │ (regex)  │ │ (verbs/grammar│  │
│  └────────┘ └──────────┘ └───────────────┘  │
├─────────────────────────────────────────────┤
│         API Routes (Next.js)                 │
│  ┌────────┐ ┌────────┐ ┌──────────────────┐ │
│  │ Resume │ │  Parse │ │  GitHub          │ │
│  │ CRUD   │ │   CV   │ │  Proxy          │ │
│  └────────┘ └────────┘ └──────────────────┘ │
├─────────────────────────────────────────────┤
│  Database (Optional — if DATABASE_URL set)   │
│  ┌────────┐ ┌────────┐ ┌──────────────────┐ │
│  │Users*  │ │Resumes │ │  Versions        │ │
│  └────────┘ └────────┘ └──────────────────┘ │
├─────────────────────────────────────────────┤
│         External Services (Optional)         │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │ Google   │ │ GitHub   │ │ Cloudflare  │  │
│  │ Drive    │ │ API      │ │ (Visitors)  │  │
│  └──────────┘ └──────────┘ └─────────────┘  │
└─────────────────────────────────────────────┘

* Users table only exists when Better Auth is configured
```

## Key Design Decisions

- **State Management**: Zustand with persist middleware — localStorage is primary storage
- **Database**: Optional — PostgreSQL via Drizzle ORM (for cloud sync when configured)
- **Auth**: Optional — Better Auth (for multi-device sync, not required)
- **Templates**: React components with common renderer interface
- **Export**: Dynamic imports for heavy libraries (react-pdf, docx)
- **Smart Helpers**: 100% local — action-verb bank, rewriter patterns, grammar checker (Hunspell dictionaries)
- **CV Parsing**: Pure regex — fast, offline, deterministic
- **GitHub**: Direct API fetch with fallback (Octokit optional)
- **Visitor Counter**: Cloudflare Worker with KV storage

## Data Flow

1. User edits resume → Zustand store updates → localStorage persists automatically
2. Autosave → POST/PUT /api/resumes → PostgreSQL (if configured, otherwise skip)
3. Preview re-renders from store via template engine
4. Export → Export Engine → Provider (PDF/DOCX/JSON/Markdown/TXT) → Download
5. ATS/Quick Actions/JD Analyzer → Engine Logic → Response (all client-side)

## Graceful Degradation

| Feature | Without DB | With DB |
|---------|-----------|---------|
| Resume editing | localStorage | localStorage + server backup |
| Version history | localStorage (2 versions) | PostgreSQL (unlimited) |
| Multi-device | Not supported | Cloud sync |
| Analytics | Client-side only | Server-side tracking |
| Smart Helpers | Always available (local) | Always available (local) |
| Grammar check | nspell dictionary bundled | nspell dictionary bundled |

## Performance Targets

- Lighthouse Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- PWA: 90+
- Initial JS bundle: < 500 KB
