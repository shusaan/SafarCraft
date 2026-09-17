# CareerForge AI — Tier Plan & Roadmap

> **Positioning**: *The MIT-licensed resume builder for engineers. 100% free forever, runs in your browser. Cloud sync + AI tailoring + 25+ premium templates for $5/mo when you want it.*

---

## Tier model

### Tier 1 — **Free Forever** (no account, no card)
A *complete* daily-driver. Users can finish and send a job application without ever paying.

| Feature | Tier 1 |
|---|---|
| Resume builder — all sections, drag-and-drop, autosave | ✅ |
| Smart local helpers (verb swap, bullet rewriter, metric prompter, achievements, grammar, summary) | ✅ |
| 5-axis ATS scoring + per-deduction recommendations | ✅ |
| JD keyword matcher (local, no LLM) | ✅ |
| ATS validation against Workday / Greenhouse / Lever heuristics | ✅ |
| Snippet library + local version history | ✅ |
| GitHub import (projects, skills, summary) | ✅ |
| Portfolio generator (Website, README, Bio, Landing) | ✅ |
| **8 free templates** (Classic ATS, Modern Pro, Executive, Pikachu, Onyx, Leafish, Bronzor, Gengar) | ✅ |
| **JSON Resume I/O** (import + export) | ✅ |
| Export PDF (client-side), DOCX, Markdown, JSON Resume | ✅ |
| **Share link** — `careerforge.app/r/xxx` with our branding | ✅ |
| Unlimited PDF downloads | ✅ |
| Storage | browser localStorage |
| Watermark | none |

### Tier 2 — **Pro** — $5/mo or $48/yr  *(designed; not started)*

> Goal: convert active job seekers who need conveniences, not gate core features.

### Open decisions (resolved)

- **AI rewrite**: **BYOK only** (OpenAI / Anthropic / Google keys, encrypted client-side).
  Reviewed managed vs BYOK — chose BYOK for zero infra cost, privacy alignment, and
  no extra SKU. Re-evaluate post-launch if >60% trial users abandon the key step.
- **Pricing page**: **public** at `/pricing`, no login, SEO-optimised.
- **Annual pricing**: monthly **$5** + annual **$48** only. **No 3-year deal.**
- **Free-tier cap**: **5 saved resumes** locally. 6th onwards gets a soft upgrade
  banner, not a wall. All other Tier 1 features stay unlimited.

### Why $5/mo

- Below Resume.io ($24), Enhancv ($24), Zety ($23.96) — defensible "fraction of the cost".
- 10k Pro users ≈ $50k MRR ($600k ARR) — funds continued development.
- Annual ($48) is a 20% discount and improves cashflow.

### Feature matrix vs. Tier 1

| Feature | Free | Pro |
|---|:---:|:---:|
| Resume builder + smart helpers + ATS scoring | ✅ | ✅ |
| 8 free templates | ✅ | ✅ |
| 25+ premium templates (designer-curated) | — | ✅ |
| JSON Resume I/O | ✅ | ✅ |
| Share link `careerforge.app/r/…` | ✅ | ✅ |
| Custom-domain share link `resume.yourdomain.com` | — | ✅ |
| Cloud sync across devices (unlimited resumes) | — | ✅ |
| **AI rewrite (BYOK: OpenAI / Anthropic / Google)** | — | ✅ |
| JD-powered tailoring *(already shipped in Tier 1)* | ✅ | ✅ |
| Cover-letter ↔ resume design matching | — | ✅ |
| Plain-TXT export | — | ✅ |
| Portfolio site `yourname.dev` (custom domain) | — | ✅ |
| No `careerforge.app` branding on share link | — | ✅ |
| Priority email support | — | ✅ |
| Saved resumes | **5** | **Unlimited** |

### What stays free forever

- All Tier 1 features listed above — no watermark, no export limits.
- 6th resume onwards: visible with edit access, but shows upgrade banner.
- No daily/monthly submission limits.
- Active job seekers with 6+ saved versions are exactly the Pro target persona.

### Implementation order — revenue-first

```
T2.1 Billing      ──► T2.9 Pricing page ──► T2.10 Pro flag
                                                  │
                                                  ▼
T2.3 Premium templates ──► T2.6 Plain-TXT ──► T2.7 Cover-letter matching
                                                  │
                                                  ▼
                              T2.4 AI rewrite (BYOK)
                                                  │
                                                  ▼
                  T2.2 Cloud sync ──► T2.5 Custom-domain share ──► T2.8 Custom portfolio
```

| # | Item | Depends on |
|---|------|----------|
| **T2.1** | Billing infra (Stripe Checkout + webhook + customer portal) | — |
| **T2.9** | `/pricing` page (public, SEO) | T2.1 |
| **T2.10** | Per-user Pro flag + watermark toggle + 6th-resume banner | T2.1 |
| **T2.3** | 25+ premium templates (mark current 8 as Pro, add new ones) | — |
| **T2.6** | Plain-TXT export | — |
| **T2.7** | Cover-letter ↔ resume design matching | T2.3 |
| **T2.4** | AI rewrite (BYOK; Web Crypto AES-GCM + PBKDF2) | — |
| **T2.2** | Cloud sync (Drizzle schema + sync engine) | T2.1 |
| **T2.5** | Custom-domain share link (CNAME flow + edge rewrite) | T2.2 |
| **T2.8** | Custom-domain portfolio site (`yourname.dev`) | T2.5 |

First dollar can arrive ~3 weeks after Tier 2 starts.

### Conversion triggers (who upgrades and why)

- **Active job seeker** (10+ applications/yr): wants AI rewrite per JD → converts.
- **Senior IC switching jobs**: needs multiple resume versions → converts.
- **International candidate**: wants EU-format templates + custom domain → converts.
- **Engineer with GitHub portfolio**: wants `yourname.dev` → converts.

### Deferred (post v5.1 launch)

- Managed AI keys ($3 add-on) — only if conversion data demands it.
- 3-year deal — only if asked by an enterprise.
- Tier 3 (Team / career coaches) — separate milestone after Pro is in market.

---

### Tier 3 — **Team** — $19/mo (career coaches, universities)  *(designed, not started)*
All Tier 2 + B2B.

- Up to 50 client resumes from one dashboard
- White-label share link
- Bulk ATS scan across clients
- Client-collaboration comments
- CSV export of client roster

Post-Pro. Implementation order to be defined when Tier 2 reaches steady-state MRR.

---

## Tier 1 Implementation Roadmap (this milestone)

| # | Item | Visible? |
|---|------|----------|
| **T1.1** | 5 more free templates (Pikachu, Onyx, Leafish, Bronzor, Gengar) | Builder → Templates panel |
| **T1.2** | JSON Resume import + export | Builder → Export panel + new "Import" button |
| **T1.3** | JD-powered tailoring (curated, no LLM) | Builder → Quick Actions → "JD Tailor" tool, with diff UI |
| **T1.4** | ATS validation: Workday / Greenhouse / Lever parsers | Builder → ATS panel → "Tested against 3 ATS vendors" section |
| **T1.5** | Share link (`/r/[id]` read-only public URL) | Builder → toolbar button + public viewer page |
| **T1.6** | SEO content pages — `/blog` with 3 guides | Marketing site |
| **T1.7** | Client-side PDF (remove Browserless dependency) | deferred — server-side Playwright works but is heavy; switching to `@react-pdf/renderer` is non-trivial (template system needs to be re-authored for it). Tracked as a v5.1 follow-up after Tier 1 ships. |

Tier 2 (Pro) and Tier 3 (Team) are designed but not implemented in this milestone. Their billing infrastructure is intentionally deferred — only build once Tier 1 is in production.

---

## What we are NOT putting behind the paywall

To stay credible as "free forever":
- ATS score, deductions, recommendations
- Basic templates (cap at 8 free, not gate all of them)
- DOCX / Markdown / JSON Resume export
- Local smart helpers
- Unlimited PDF downloads
- JSON Resume import/export (ecosystem play)
- Share link with `careerforge.app` branding

---

## Open questions for later

1. Billing infra (Stripe? Paddle? LemonSqueezy?) — defer until Tier 1 ships
2. Pro AI rewrite UX — BYOK vs managed-key (+$3/mo) — pick one before Tier 2 ships
3. Cloud sync backend — Drizzle + Postgres is already wired; needs a sync engine
4. SEO content cadence — 2 posts/month for the first 6 months