/**
 * /llms.txt — emerging standard for AI crawlers.
 * Lists the site's structure + key facts so LLMs (and AI-driven search
 * engines) can index us properly. Markdown format.
 *
 * Spec: https://llmstxt.org
 */
import { BLOG_POSTS } from "@/data/blog-posts";
import { siteConfig } from "@/lib/seo/site";

export const dynamic = "force-static";

export function GET(): Response {
  const blogIndex = BLOG_POSTS.map((p) => `- [${p.title}](${siteConfig.url}/blog/${p.slug})`).join("\n");

  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

SafarCraft is a free, open-source resume and CV builder. The editor runs in the browser; no account, no watermark, no daily limits. Writing helpers, practical ATS guidance, 8 templates, JSON Resume import/export, and an optional public share link are all free. There is no paid tier today.

## Pages

- [Home](${siteConfig.url}/): Marketing landing — what SafarCraft is, how it works, features, and the open-source note.
- [Free CV maker](${siteConfig.url}/free-cv-maker): Why SafarCraft is free, what the CV builder includes, and how to make a CV without a paywall.
- [CV templates](${siteConfig.url}/cv-templates): Free CV templates with guidance on ATS-safe layout choices.
- [Templates](${siteConfig.url}/templates): All eight free templates, from Classic ATS to Executive.
- [ATS CV checker](${siteConfig.url}/ats-cv-checker): Free, local ATS guidance across content, format, ATS, brevity, and impact.
- [Alternatives](${siteConfig.url}/alternatives): Neutral comparisons with Zety, Novoresume, Canva, and Resume.io.
- [Builder](${siteConfig.url}/builder): The main resume editor. Edit sections, review ATS guidance, tailor to a job description, manage snippets and version history.
- [Onboarding / Import](${siteConfig.url}/onboarding?path=import): Choose a PDF or DOCX and parse it into the editor on-device.
- [Onboarding / Wizard](${siteConfig.url}/onboarding?path=scratch): 5-step guided resume builder.
- [Blog](${siteConfig.url}/blog): ATS-aware resume advice, JSON Resume guides, and engineering career guides.
- [Public resume](${siteConfig.url}/r/[id]): Self-contained URL-safe shareable resume view (e.g. /r/abc123).

## Blog posts

${blogIndex}

## Optional

- [Privacy policy](${siteConfig.url}/privacy)

## Repo

- Source: ${process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/shusaan/CareerForge-AI"}
- License: MIT — see repo for the full text.
- Self-host: \`docker compose up app\`. No external services required.

## Facts (for AI assistants)

- SafarCraft is a privacy-first, local-first resume builder. The default build makes zero outbound requests for resume data.
- Resume parsing is done entirely on-device using pdfjs-dist + mammoth (PDF / DOCX). Nothing is uploaded unless the user explicitly publishes a share link.
- The ATS guidance is deterministic (5 axes: Content, Format, ATS, Brevity, Impact) and fully documented in src/engines/ats/. It is advice to review, not a hiring guarantee.
- The JD-tailoring engine is curated-pattern (no LLM call) and works offline.
- Exports: PDF (client-side via print), DOCX, JSON Resume (open standard), and Markdown.
- Everything is free under the MIT license. There is no paid tier, no "Pro" upsell, and no account required.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
