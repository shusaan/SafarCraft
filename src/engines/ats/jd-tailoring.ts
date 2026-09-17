// JD Tailoring — local, no LLM. Reorders skills, surfaces bullets that match
// the JD's keywords, and suggests additional bullets drawn from curated
// per-domain patterns + the candidate's existing technology tags.
import type { ResumeData, ExperienceEntry } from "@/types";

type TechDomain = "frontend" | "backend" | "data" | "devops" | "mobile" | "general";

const DOMAIN_KEYWORDS: Record<TechDomain, string[]> = {
  frontend: [
    "react", "vue", "angular", "next", "next.js", "svelte", "redux",
    "typescript", "javascript", "tailwind", "css", "html", "webpack",
    "vite", "storybook", "jest", "cypress", "playwright", "design system",
    "accessibility", "a11y", "responsive", "spa", "ssr", "seo", "figma",
  ],
  backend: [
    "node", "node.js", "express", "fastify", "nestjs", "django", "flask",
    "spring", "rails", "go", "rust", "java", "kotlin", "python",
    "rest", "graphql", "grpc", "kafka", "rabbitmq", "redis", "postgres",
    "postgresql", "mysql", "mongodb", "elasticsearch", "sql", "orm",
    "microservices", "monolith", "auth", "oauth", "jwt",
  ],
  data: [
    "python", "pandas", "numpy", "sql", "spark", "hadoop", "airflow",
    "dbt", "snowflake", "bigquery", "redshift", "etl", "elt",
    "machine learning", "ml", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "statistics", "tableau", "powerbi", "looker",
    "data warehouse", "data lake", "feature engineering", "nlp",
  ],
  devops: [
    "kubernetes", "k8s", "docker", "helm", "terraform", "ansible",
    "jenkins", "github actions", "circleci", "argo", "argoCD",
    "prometheus", "grafana", "elk", "datadog", "newrelic", "splunk",
    "sre", "devops", "platform", "ci/cd", "linux", "bash", "aws", "gcp",
    "azure", "vpc", "iam", "route53", "cloudfront", "lambda", "ec2",
    "eks", "rds", "s3", "observability", "monitoring", "incident",
  ],
  mobile: [
    "swift", "swiftui", "objective-c", "kotlin", "java", "android",
    "ios", "flutter", "react native", "xamarin", "jetpack compose",
    "rxjava", "coroutines", "mvvm", "mvc", "graphql",
  ],
  general: [
    "git", "agile", "scrum", "kanban", "ci/cd", "rest", "api",
    "testing", "tdd", "documentation", "communication", "mentoring",
    "leadership", "stakeholder", "roadmap", "okr", "kpi", "metrics",
  ],
};

const DOMAIN_BULLET_TEMPLATES: Record<TechDomain, string[]> = {
  frontend: [
    "Built accessible {keyword} components used across {keyword} pages, improving Lighthouse score by N points",
    "Reduced bundle size by N% by code-splitting with {keyword} and lazy-loading routes",
    "Migrated a legacy {keyword} codebase to modern {keyword}, cutting p99 latency by N%",
  ],
  backend: [
    "Designed and shipped a {keyword} service handling N req/s with p99 latency under Nms",
    "Cut infrastructure spend by N% by migrating from {keyword} to {keyword}",
    "Owned the migration of N microservices from {keyword} to {keyword}, with zero downtime",
  ],
  data: [
    "Built a {keyword} pipeline processing N records/day, reducing dashboard latency from Nh to Nm",
    "Improved model F1 by N points by feature-engineering with {keyword} on N training rows",
    "Migrated reporting from {keyword} to {keyword}, saving N engineer-days of in-quarter",
  ],
  devops: [
    "Reduced mean-time-to-recovery by N% by introducing {keyword} runbooks and SLOs",
    "Cut cloud spend by N% by rightsizing {keyword} workloads and switching to spot instances",
    "Cut deploy time from Nmin to Ns by introducing {keyword} with progressive delivery",
  ],
  mobile: [
    "Shipped {keyword} feature used by N% of MAUs with crash-free rate above 99.9%",
    "Reduced cold start time by N% by lazy-loading {keyword} modules on {keyword}",
    "Improved App Store rating from X.X to Y.Y by fixing N crashes traced through {keyword}",
  ],
  general: [
    "Mentored N engineers on {keyword}, raising team velocity by N% over N months",
    "Drove the migration from {keyword} to {keyword}, completing N tasks across N squads",
  ],
};

function detectDomains(jd: string): TechDomain[] {
  const lower = jd.toLowerCase();
  const counts: Partial<Record<TechDomain, number>> = {};
  for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS) as [TechDomain, string[]][]) {
    let c = 0;
    for (const kw of kws) if (lower.includes(kw)) c++;
    if (c > 0) counts[domain] = c;
  }
  return (Object.entries(counts) as [TechDomain, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([d]) => d);
}

export interface TailoringChange {
  kind: "add-bullet" | "rewrite-bullet" | "reorder-skills" | "add-skill" | "summary";
  /** Path into ResumeData for diff/restore. */
  path: string;
  before?: string;
  after: string;
  reason: string;
  /** Confidence 0..1 — how strongly the JD supports this change. */
  confidence: number;
}

export interface TailoringPlan {
  matchScore: number;
  jdKeywords: string[];
  resumeKeywords: string[];
  missingKeywords: string[];
  domains: TechDomain[];
  changes: TailoringChange[];
  summarySuggestion: string;
}

function pickBulletsForExperience(
  exp: ExperienceEntry,
  jdKeywords: string[],
  maxPerRole = 1,
): TailoringChange[] {
  const changes: TailoringChange[] = [];
  const used = new Set<number>();

  for (const kw of jdKeywords) {
    if (used.size >= maxPerRole) break;
    // Find a bullet that mentions this keyword (case-insensitive)
    const idx = exp.bullets.findIndex(
      (b, i) => !used.has(i) && b && b.toLowerCase().includes(kw.toLowerCase()),
    );
    if (idx >= 0) {
      used.add(idx);
      const bulletText = exp.bullets[idx] ?? "";
      changes.push({
        kind: "rewrite-bullet",
        path: `experience.${exp.id}.bullets.${idx}`,
        before: bulletText,
        after: bulletText, // we don't rewrite, we surface (priority sort)
        reason: `Surfacing bullet containing "${kw}" — move higher in the list`,
        confidence: 0.7,
      });
    }
  }

  return changes;
}

function reorderSkills(jdKeywords: string[]): TailoringChange[] {
  // Pure reordering suggestion: put JD-matching categories first
  return [{
    kind: "reorder-skills",
    path: "skills",
    after: "Move categories that match the JD keywords to the top",
    reason: `JD emphasises ${jdKeywords.slice(0, 5).join(", ")}`,
    confidence: 0.6,
  }];
}

function suggestBulletsForMissing(
  domains: TechDomain[],
  missingKeywords: string[],
): TailoringChange[] {
  const changes: TailoringChange[] = [];
  if (missingKeywords.length === 0) return changes;
  const domain: TechDomain = domains[0] ?? "general";
  const templates = DOMAIN_BULLET_TEMPLATES[domain];
  const kw = missingKeywords[0];
  if (!kw) return changes;
  // Pick the first template that contains the keyword
  const tmpl = templates.find((t) => t.includes("{keyword}")) ?? templates[0] ?? "";
  const draft = tmpl.replace(/{keyword}/g, kw).replace(/N/g, "10");
  changes.push({
    kind: "add-bullet",
    path: "experience[latest].bullets",
    after: draft,
    reason: `Draft bullet reflecting the missing skill "${kw}". Replace N with a real number from your work.`,
    confidence: 0.4,
  });
  return changes;
}

function suggestSummary(
  jdKeywords: string[],
  missingKeywords: string[],
  domains: TechDomain[],
): string {
  const top = jdKeywords.slice(0, 3).join(", ");
  const learn = missingKeywords.length > 0
    ? ` Familiar with ${missingKeywords.slice(0, 3).join(", ")}.`
    : "";
  const primaryDomain: TechDomain = domains[0] ?? "general";
  const domainLabel = primaryDomain.charAt(0).toUpperCase() + primaryDomain.slice(1);
  return `${domainLabel} engineer with hands-on experience in ${top}.${learn} (Replace this draft with your actual story — your authentic voice matters more than keywords.)`;
}

export function planTailoring(jd: string, data: ResumeData): TailoringPlan {
  const lowerJD = jd.toLowerCase();

  const jdKeywords = new Set<string>();
  for (const kws of Object.values(DOMAIN_KEYWORDS)) {
    for (const k of kws) if (lowerJD.includes(k.toLowerCase())) jdKeywords.add(k);
  }

  const allResumeText = [
    data.personal.summary ?? "",
    ...data.experience.flatMap((e) => [e.position, e.company, ...e.bullets, ...e.technologies]),
    ...data.skills.flatMap((c) => [c.category, ...c.skills]),
    ...data.projects.flatMap((p) => [p.name, p.description, ...p.technologies]),
  ].join(" ").toLowerCase();

  const jdKws = Array.from(jdKeywords);
  const resumeKeywords = jdKws.filter((k) => allResumeText.includes(k.toLowerCase()));
  const missingKeywords = jdKws.filter((k) => !allResumeText.includes(k.toLowerCase()));

  const matchScore = jdKws.length === 0
    ? 0
    : Math.round((resumeKeywords.length / jdKws.length) * 100);

  const domains = detectDomains(jd);

  const changes: TailoringChange[] = [];

  // For each experience entry, surface up to 2 bullets that match the JD.
  for (const exp of data.experience.slice(0, 4)) {
    changes.push(...pickBulletsForExperience(exp, jdKws));
  }

  // Reorder skills
  changes.push(...reorderSkills(jdKws));

  // Suggest bullets for the top missing keyword
  changes.push(...suggestBulletsForMissing(domains, missingKeywords));

  return {
    matchScore,
    jdKeywords: jdKws,
    resumeKeywords,
    missingKeywords,
    domains,
    changes,
    summarySuggestion: suggestSummary(jdKws, missingKeywords, domains),
  };
}