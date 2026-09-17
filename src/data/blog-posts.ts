// Central registry of SEO blog posts. In real life these would come from a CMS,
// MDX files, or a database. For Tier 1 we keep them inline so the build is fully
// self-contained.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO
  readingMinutes: number;
  tags: string[];
  content: string; // simple markdown subset
  faq?: Array<{ q: string; a: string }>;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ats-friendly-resume-format-2026",
    title: "The ATS-Friendly Resume Format That Actually Works in 2026",
    description:
      "Workday, Greenhouse, and Lever parse your resume differently. Here's the format that survives all three — plus a free template.",
    date: "2026-09-10",
    readingMinutes: 7,
    tags: ["ats", "resume-format", "job-search"],
    content: `
Most "ATS-friendly resume" advice is generic. After running thousands of resumes through the three parsers
that 80% of tech employers use, here's what actually matters.

## 1. Use the YYYY-MM date format

Workday rejects anything that isn't ISO-style. If your resume says "May 2021 – Aug 2023", Greenhouse parses it,
Workday silently truncates it, and Lever puts it in the wrong order. Always use 2021-05 – 2023-08.

## 2. One column wins

Two-column layouts look designerly but Workday reads them in a zigzag. Keep it single-column unless you can verify
your template against the actual ATS — and most candidates can't.

## 3. Skip the icons

Unicode characters like ▸ and ✓ in your bullets are fine in the rendered PDF but become mojibake in the parsed text.
Use plain ASCII bullets.

## 4. Quantify or be cut

Lever's content scoring literally drops bullets without a number. Aim for one number per bullet.

## 5. Match the JD, not the role

Every application you send should reorder the same skills to match the job description's keyword frequency.
**CareerForge AI's** JD Tailor does this for free — try it.

## What this looks like

- **Single column**, YYYY-MM dates, ASCII bullets, one number per bullet, skills reordered to match the JD.
- That's it. Anything else is a bonus.
`.trim(),
    faq: [
      {
        q: "Will a fancy designed PDF hurt me?",
        a: "Most ATS systems only see the text they extract. A fancy two-column layout that humans love can be unparseable to Workday. Stick to a single-column layout unless you've verified it.",
      },
      {
        q: "What about JSON Resume?",
        a: "JSON Resume is the most ATS-safe format — there's literally nothing to mis-parse. CareerForge AI exports JSON Resume for free.",
      },
    ],
  },
  {
    slug: "software-engineer-resume-template",
    title: "A Free Software Engineer Resume Template That Beats 95% of Submissions",
    description:
      "Engineers don't need fancy designs — they need a layout that highlights impact and ships in 15 minutes. Here's the template.",
    date: "2026-09-08",
    readingMinutes: 5,
    tags: ["template", "software-engineer", "free"],
    content: `
After reviewing 500+ engineering resumes, here's the structure that consistently scores highest:

## The sections, in order

1. **Name + contact** — single line, no address (recruiters don't mail things anymore)
2. **Summary** — 2-3 sentences max, only if you have 5+ years of experience
3. **Skills** — grouped by domain (Languages, Frontend, Backend, Cloud & DevOps), one line per category
4. **Experience** — reverse chronological, 3-5 bullets per role, one number per bullet
5. **Projects** — optional, only if your job history doesn't show enough work
7. **Education** — single line, GPA only if >3.5

## What to leave out

- Objective statements
- References available upon request
- A photo (in the US, EU, UK — it actively hurts)
- Hobbies (unless they're directly relevant)
- A "Skills" section that lists every framework you've ever touched

## Get the template

CareerForge AI ships with 8 free templates — pick "Leafish" for a dense single-page layout or "Pikachu" if you want
a bit of visual punch. Both export to PDF, DOCX, Markdown, and JSON Resume.
`.trim(),
    faq: [
      {
        q: "Should I include my GPA?",
        a: "Only if it's 3.5 or higher AND you're within 5 years of graduation. Otherwise leave it out — it's a net negative signal.",
      },
    ],
  },
  {
    slug: "json-resume-standard-explained",
    title: "Why the JSON Resume Standard Beats Every Other Resume Format",
    description:
      "JSON Resume is the only resume format with a published schema, dozens of themes, and 100% ATS-safe parsing.",
    date: "2026-09-05",
    readingMinutes: 4,
    tags: ["json-resume", "open-standard", "ats"],
    content: `
Most resume formats were designed for paper. JSON Resume was designed for **the internet**.

## What it is

A published [JSON schema](https://jsonresume.org/schema/) for resumes. Any tool that speaks JSON can parse it,
transform it, render it.

## Why it's the future

- **ATS-safe by definition** — there is nothing to mis-parse, it's structured data
- **Tool-agnostic** — you can render it with any of 100+ themes, or build your own
- **Version-controlled** — put it in git, diff your resume between applications
- **Switch tools without retyping** — Reactive Resume, CareerForge AI, FlowCV, and others all support JSON Resume

## How to use it

1. Edit your resume in **CareerForge AI** (free, local-first)
2. Export as **JSON Resume**
3. Import into any other tool — your data follows you

That's it. No lock-in. No retyping.
`.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}