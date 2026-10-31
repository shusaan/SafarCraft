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
Most "ATS-friendly resume" advice is generic. Based on publicly documented parser behaviour from the
applicant tracking systems many tech employers use, here's what actually matters.

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
**SafarCraft's** JD Tailor does this for free — try it.

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
        a: "JSON Resume is the most ATS-safe format — there's literally nothing to mis-parse. SafarCraft exports JSON Resume for free.",
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
A clear structure matters more than decoration. Here's the layout that is easiest for both recruiters and parsers to read:

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

SafarCraft ships with 8 free templates — pick "Leafish" for a dense single-page layout or "Pikachu" if you want
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
- **Switch tools without retyping** — Reactive Resume, SafarCraft, FlowCV, and others all support JSON Resume

## How to use it

1. Edit your resume in **SafarCraft** (free, local-first)
2. Export as **JSON Resume**
3. Import into any other tool — your data follows you

That's it. No lock-in. No retyping.
`.trim(),
  },
  {
    slug: "how-to-make-a-cv-for-free",
    title: "How to Make a CV for Free (Without a Watermark or Paywall)",
    description:
      "A practical, step-by-step guide to making a free CV online, including what to include, how long it should be, and how to export a clean PDF.",
    date: "2026-10-20",
    readingMinutes: 6,
    tags: ["cv", "free", "guide", "job-search"],
    content: `
A lot of "free CV maker" tools let you build a CV and then ask you to pay before you can download it.
This guide covers how to make a CV for free and export a clean, readable file without a watermark.

## 1. Choose the right length

- **0–5 years of experience:** one page.
- **5–10 years:** one or two pages if every line earns its place.
- **10+ years or academic roles:** a longer CV can be appropriate.

The page limit is a guideline, not a rule. Recruiters scan for relevance, so cut older work that
does not support the role you are applying for.

## 2. Put the important things first

1. **Name and contact details** — email, phone, city, and one relevant link.
2. **A short summary** — two or three lines, only if it adds context.
3. **Experience** — reverse chronological, with short outcome-focused bullets.
4. **Skills** — grouped and specific, not a list of every tool you have touched.
5. **Education** — one line per qualification.

## 3. Write bullets that are easy to scan

Use a strong verb, describe the action, and add the result where you can:

> Cut checkout errors by 18% by adding validation at the payment boundary.

If you do not have a number, describe the scope instead: team size, users affected, or time saved.
Avoid dense paragraphs and long lists of duties.

## 4. Keep the format parser-safe

- Single column for online applications.
- Standard section headings: Experience, Education, Skills.
- Consistent dates, preferably YYYY-MM.
- Avoid text boxes, tables in the main body, and icon-only contact details.

## 5. Export the file

Export a PDF for applications and keep an editable DOCX or JSON Resume copy for future edits.
Check the PDF opens on another device and that the text is selectable — if you can select it, a parser
can usually read it too.

## Make it free with SafarCraft

SafarCraft is a free CV maker with no signup, no watermark, and no download paywall. Start from a
template or import an existing CV, review the ATS guidance, and export PDF, DOCX, or JSON Resume.
`.trim(),
    faq: [
      {
        q: "Is a free CV maker actually free?",
        a: "It depends on the tool. Some let you build for free but charge for downloads. SafarCraft does not charge for PDF or DOCX exports and does not add a watermark.",
      },
      {
        q: "How long should a CV be?",
        a: "One page is usually enough for early-career candidates. Two pages are reasonable with substantial relevant experience. Only go longer for academic or research CVs.",
      },
      {
        q: "Should I include a photo?",
        a: "In the US, UK, and much of the EU, a photo is usually unnecessary and can introduce bias. Follow the norm in your local job market.",
      },
    ],
  },
  {
    slug: "cv-vs-resume-difference",
    title: "CV vs Resume: What's the Difference and Which Should You Use?",
    description:
      "CV and resume are often used interchangeably, but the terms mean different things in different countries. Here's a simple breakdown.",
    date: "2026-10-12",
    readingMinutes: 4,
    tags: ["cv", "resume", "guide"],
    content: `
The short answer: in the US and Canada, a **resume** is a short, tailored summary of your experience,
while a **CV** (curriculum vitae) is a longer academic record. In the UK, Ireland, Australia, and much of
Asia, "CV" is the normal word for the document US employers call a resume.

## Quick comparison

| | Resume | CV |
|---|---|---|
| Typical length | 1–2 pages | 2+ pages |
| Focus | Relevance to one role | Full academic and professional record |
| Common in | US, Canada | UK, EU, Asia, academia |
| Updates | Tailored per application | Updated as the record grows |

## Which should you use?

Follow the employer's wording. If the job ad asks for a CV, send a CV. If it asks for a resume, send a
resume. When the wording is ambiguous, match the local convention and keep the document focused on the
role.

For most private-sector applications outside academia, the practical advice is the same either way:
keep it concise, lead with recent relevant work, and make it easy to scan.

## Common mistakes

- A two-page resume with no relevant content on page two.
- A "CV" that is really a list of duties with no outcomes.
- Inconsistent date formats or missing month/year values.
- Including every qualification instead of the relevant ones.

## Build either format for free

SafarCraft works for both CVs and resumes. Choose a template, edit online, and export a free PDF or DOCX.
`.trim(),
    faq: [
      {
        q: "Is a CV the same as a resume?",
        a: "In the US and Canada, no: a resume is a short tailored summary and a CV is a longer academic record. In the UK and many other countries, CV is the standard term for the short document.",
      },
    ],
  },
  {
    slug: "free-cv-template-ats",
    title: "Free ATS-Friendly CV Templates: What to Look For",
    description:
      "Not every free CV template is parser-safe. Here are the layout choices that keep your CV readable by applicant tracking systems.",
    date: "2026-10-05",
    readingMinutes: 5,
    tags: ["cv", "templates", "ats", "free"],
    content: `
A template can look great and still fail an applicant tracking system. The difference is usually
structural, not visual. Use this checklist when you pick a free CV template.

## Choose structure over decoration

- **Single column** for online applications. Multi-column layouts can be read out of order by parsers.
- **Standard headings** such as Experience, Education, and Skills.
- **Plain bullets** instead of icons or unusual Unicode characters.
- **No tables or text boxes** around the main content.
- **Selectable text** in the exported PDF.

## Keep contact details as text

Put your email, phone, and location in normal text. If the contact details live inside an image or a
text box, a parser may miss them entirely.

## Use dates consistently

Pick YYYY-MM or Month YYYY and use it everywhere. Mixed formats are a common cause of missing or
misordered roles.

## Check the output, not just the preview

Open the exported PDF and try to select the text. If you can copy the text cleanly, a parser usually
can too. Also check the file at a small zoom level — if headings disappear or text overlaps, the layout
is too fragile.

## Free does not have to mean compromised

SafarCraft ships eight free templates, including a single-column Classic ATS layout. You can switch
templates without retyping your content and export a free PDF or DOCX.
`.trim(),
    faq: [
      {
        q: "Are free CV templates safe for ATS?",
        a: "Only if the layout is parser-friendly. Look for a single column, standard headings, plain text contact details, and selectable text in the exported PDF.",
      },
      {
        q: "Can I use a two-column CV template?",
        a: "For direct applications yes, but for large employers using parsers, a single-column layout is safer. You can keep a design-forward version for human readers.",
      },
    ],
  },
];

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}