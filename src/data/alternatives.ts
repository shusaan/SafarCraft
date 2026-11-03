/**
 * Competitor alternatives pages.
 *
 * Keep every claim neutral, link to the competitor's own pricing page, and
 * include the "verify current pricing" note — plans change frequently and we
 * do not want stale comparison copy.
 */
export interface Alternative {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string;
  freeTier: string;
  pricingNote: string;
  website: string;
  highlights: string[];
  safarCraftWins: string[];
}

export const ALTERNATIVES: Alternative[] = [
  {
    slug: "zety",
    name: "Zety",
    tagline: "A polished resume builder with strong guided writing.",
    description:
      "Zety is one of the best-known resume builders. It offers guided content suggestions, many templates, and a familiar step-by-step editor.",
    bestFor: "People who want heavy guidance and do not mind a subscription.",
    freeTier:
      "You can usually build and preview a resume for free, but downloading the final PDF typically requires a paid plan.",
    pricingNote: "Check Zety's current pricing page for the latest plan details.",
    website: "https://zety.com/",
    highlights: [
      "Guided, question-by-question editor",
      "Large template library",
      "Cover letter and CV tools alongside resumes",
    ],
    safarCraftWins: [
      "Export PDF, DOCX and JSON Resume without a paywall",
      "No account required — the draft stays in your browser",
      "Open source and self-hostable under MIT",
    ],
  },
  {
    slug: "novoresume",
    name: "Novoresume",
    tagline: "Design-forward templates with a free tier.",
    description:
      "Novoresume focuses on visually distinctive templates and a clean editor. It is a popular choice for candidates who want a modern look.",
    bestFor: "Candidates who prioritise visual design and simple editing.",
    freeTier:
      "A limited free plan is available; advanced templates and features are part of the paid plan.",
    pricingNote: "Check Novoresume's current pricing page for the latest plan details.",
    website: "https://novoresume.com/",
    highlights: [
      "Modern, design-led templates",
      "Simple section-based editing",
      "Cover letter support",
    ],
    safarCraftWins: [
      "All eight templates and exports are free",
      "ATS guidance is deterministic and runs locally",
      "Your resume text is not sent to a server by default",
    ],
  },
  {
    slug: "canva",
    name: "Canva",
    tagline: "A general design tool with resume templates.",
    description:
      "Canva is a broad design platform with a large library of resume and CV templates. It is excellent for visual work but not purpose-built for ATS parsing.",
    bestFor: "Designers and creatives who want full visual control.",
    freeTier:
      "Canva has a free plan with premium templates and assets available on paid plans.",
    pricingNote: "Check Canva's current pricing page for the latest plan details.",
    website: "https://www.canva.com/resumes/templates/",
    highlights: [
      "Huge template and asset library",
      "Drag-and-drop design editor",
      "Strong for portfolios and creative roles",
    ],
    safarCraftWins: [
      "Purpose-built resume structure and ATS checks",
      "Single-column, parser-safe templates out of the box",
      "No account and no design skills required",
    ],
  },
  {
    slug: "resume-io",
    name: "Resume.io",
    tagline: "A guided resume builder with a large template set.",
    description:
      "Resume.io provides a structured builder, pre-written content suggestions, and a range of templates aimed at fast resume creation.",
    bestFor: "Job seekers who want a fast, guided build with many templates.",
    freeTier:
      "Building and previewing is typically free; downloading often requires a subscription.",
    pricingNote: "Check Resume.io's current pricing page for the latest plan details.",
    website: "https://resume.io/",
    highlights: [
      "Large template library",
      "Guided content suggestions",
      "Cover letter builder",
    ],
    safarCraftWins: [
      "Free downloads with no subscription",
      "Local-first editing with optional cloud sync",
      "Open source with a published JSON Resume export",
    ],
  },
];

export function getAlternative(slug: string): Alternative | undefined {
  return ALTERNATIVES.find((item) => item.slug === slug);
}
