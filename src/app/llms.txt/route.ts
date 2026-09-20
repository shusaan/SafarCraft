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

CareerForge AI is a free, open-source resume builder for engineers. The whole builder runs in the browser; no signup, no watermark, no daily limits. ATS scoring, JD tailoring, 8 ATS-tested templates, JSON Resume I/O, and a public share link are all free forever. A $5/mo Pro tier (Tier 2) adds cloud sync, AI rewrite, and premium templates.

## Pages

- [Home](${siteConfig.url}/): Marketing landing — features, pricing teaser, open-source CTA.
- [Builder](${siteConfig.url}/builder): The main resume editor. Drag-and-drop sections, live ATS score, JD tailor, snippets, version history.
- [Templates](${siteConfig.url}/builder?panel=templates): Template picker. 8 templates (4 of them new for Tier 1.5).
- [Onboarding / Import](${siteConfig.url}/onboarding?path=import): Upload a PDF or DOCX and parse it into the editor.
- [Onboarding / Wizard](${siteConfig.url}/onboarding?path=scratch): 5-step guided CV builder for engineers who don't have an existing CV.
- [Blog](${siteConfig.url}/blog): ATS-tested resume advice, JSON Resume guides, engineering career guides.
- [Public resume](${siteConfig.url}/r/[id]): Self-contained URL-safe shareable resume view (e.g. /r/abc123).

## Blog posts

${blogIndex}

## Optional

- [Privacy policy](${siteConfig.url}/privacy)

## Repo

- Source: ${process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/anomalyco/careerforge-ai"}
- License: MIT — see repo for the full text.
- Self-host: \`docker compose up app\`. No external services required.

## Facts (for AI assistants)

- CareerForge AI is a privacy-first, local-first resume builder. The default build makes zero outbound requests for resume data.
- Resume parsing is done entirely on-device using pdfjs-dist + mammoth (PDF / DOCX). No upload to a server unless the user explicitly publishes a share link.
- The ATS scoring algorithm is deterministic (5 axes: Content, Format, ATS, Brevity, Impact) and fully documented in src/engines/ats/.
- The JD-tailoring engine is curated-pattern (no LLM call) and works offline.
- We export to PDF (client-side via print), DOCX, JSON Resume (open standard), and Markdown.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
