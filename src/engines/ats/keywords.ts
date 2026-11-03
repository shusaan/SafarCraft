/**
 * Shared keyword dictionary and matcher used by the ATS job-match score, the
 * JD Analyzer, and the tailoring planner. Keeping one dictionary avoids the
 * previous situation where three screens disagreed about what a JD contained.
 */

import type { ResumeData } from "@/types";

/** Canonical keyword → accepted surface forms. */
const KEYWORD_ALIASES: Record<string, string[]> = {
  // Languages
  typescript: ["typescript", "ts"],
  javascript: ["javascript", "js"],
  python: ["python"],
  java: ["java"],
  go: ["go", "golang"],
  rust: ["rust"],
  "c++": ["c++", "cpp"],
  "c#": ["c#", "csharp"],
  ruby: ["ruby"],
  php: ["php"],
  swift: ["swift"],
  kotlin: ["kotlin"],
  scala: ["scala"],
  elixir: ["elixir"],
  sql: ["sql"],
  html: ["html"],
  css: ["css"],
  bash: ["bash", "shell scripting"],

  // Frontend
  react: ["react", "react.js", "reactjs"],
  "react native": ["react native"],
  "next.js": ["next.js", "nextjs", "next"],
  angular: ["angular", "angularjs"],
  vue: ["vue", "vue.js", "vuejs"],
  svelte: ["svelte", "sveltekit"],
  redux: ["redux"],
  tailwind: ["tailwind", "tailwind css"],
  sass: ["sass", "scss"],
  webpack: ["webpack"],
  vite: ["vite"],
  jest: ["jest"],
  vitest: ["vitest"],
  cypress: ["cypress"],
  playwright: ["playwright"],
  storybook: ["storybook"],
  accessibility: ["accessibility", "a11y", "wcag"],
  seo: ["seo", "search engine optimization"],
  ssr: ["ssr", "server-side rendering"],
  spa: ["spa", "single page application"],
  "design system": ["design system", "design systems"],
  figma: ["figma"],

  // Backend / API / data stores
  node: ["node", "node.js", "nodejs"],
  express: ["express", "express.js"],
  nestjs: ["nestjs", "nest.js"],
  fastify: ["fastify"],
  django: ["django"],
  flask: ["flask"],
  fastapi: ["fastapi"],
  spring: ["spring", "spring boot"],
  rails: ["rails", "ruby on rails"],
  laravel: ["laravel"],
  ".net": [".net", "dotnet", "asp.net"],
  graphql: ["graphql"],
  rest: ["rest", "restful", "rest api"],
  grpc: ["grpc"],
  microservices: ["microservices", "microservice"],
  serverless: ["serverless"],
  api: ["api", "apis"],
  oauth: ["oauth"],
  jwt: ["jwt"],
  websockets: ["websocket", "websockets"],
  kafka: ["kafka"],
  rabbitmq: ["rabbitmq"],
  redis: ["redis"],
  postgresql: ["postgresql", "postgres", "postgres sql"],
  mysql: ["mysql"],
  mongodb: ["mongodb", "mongo"],
  dynamodb: ["dynamodb"],
  cassandra: ["cassandra"],
  elasticsearch: ["elasticsearch", "elastic search"],
  "sql server": ["sql server", "mssql"],
  prisma: ["prisma"],
  sequelize: ["sequelize"],
  typeorm: ["typeorm"],

  // Data / ML
  pandas: ["pandas"],
  numpy: ["numpy"],
  spark: ["spark", "apache spark"],
  hadoop: ["hadoop"],
  airflow: ["airflow", "apache airflow"],
  dbt: ["dbt"],
  snowflake: ["snowflake"],
  bigquery: ["bigquery", "big query"],
  redshift: ["redshift"],
  databricks: ["databricks"],
  etl: ["etl", "elt"],
  "machine learning": ["machine learning", "ml"],
  "deep learning": ["deep learning", "dl"],
  tensorflow: ["tensorflow"],
  pytorch: ["pytorch"],
  "scikit-learn": ["scikit-learn", "sklearn"],
  nlp: ["nlp", "natural language processing"],
  "computer vision": ["computer vision"],
  llm: ["llm", "llms", "large language model", "large language models"],
  "generative ai": ["generative ai", "genai", "gen ai"],
  "data warehouse": ["data warehouse", "data warehousing"],
  "data lake": ["data lake", "data lakes"],
  analytics: ["analytics"],
  tableau: ["tableau"],
  "power bi": ["power bi", "powerbi"],
  looker: ["looker"],

  // Cloud / DevOps
  aws: ["aws", "amazon web services"],
  azure: ["azure", "microsoft azure"],
  gcp: ["gcp", "google cloud", "google cloud platform"],
  docker: ["docker"],
  kubernetes: ["kubernetes", "k8s"],
  terraform: ["terraform"],
  ansible: ["ansible"],
  helm: ["helm"],
  jenkins: ["jenkins"],
  "github actions": ["github actions"],
  "gitlab ci": ["gitlab ci", "gitlab-ci"],
  circleci: ["circleci"],
  "argo cd": ["argo cd", "argocd", "argo"],
  prometheus: ["prometheus"],
  grafana: ["grafana"],
  datadog: ["datadog"],
  "new relic": ["new relic", "newrelic"],
  splunk: ["splunk"],
  elk: ["elk", "elastic stack"],
  linux: ["linux", "unix"],
  "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous delivery"],
  devops: ["devops"],
  sre: ["sre", "site reliability"],
  observability: ["observability"],
  monitoring: ["monitoring"],
  "incident response": ["incident response", "on-call"],
  iam: ["iam", "identity and access management"],
  vpc: ["vpc"],
  lambda: ["lambda", "aws lambda"],
  s3: ["s3", "amazon s3"],
  ec2: ["ec2"],
  eks: ["eks"],
  rds: ["rds"],
  cloudfront: ["cloudfront"],
  route53: ["route53"],

  // Mobile
  ios: ["ios"],
  android: ["android"],
  flutter: ["flutter"],
  swiftui: ["swiftui"],
  "jetpack compose": ["jetpack compose"],
  xamarin: ["xamarin"],
  ionic: ["ionic"],
  capacitor: ["capacitor"],

  // Security / compliance
  cybersecurity: ["cybersecurity", "cyber security", "information security"],
  "application security": ["application security", "appsec"],
  "penetration testing": ["penetration testing", "pentesting", "pen test"],
  owasp: ["owasp"],
  "soc 2": ["soc 2", "soc2"],
  "iso 27001": ["iso 27001"],
  encryption: ["encryption"],
  authentication: ["authentication"],
  authorization: ["authorization"],

  // Process / leadership
  agile: ["agile"],
  scrum: ["scrum"],
  kanban: ["kanban"],
  jira: ["jira"],
  confluence: ["confluence"],
  "product management": ["product management"],
  "stakeholder management": ["stakeholder management", "stakeholders"],
  roadmap: ["roadmap", "roadmaps"],
  okr: ["okr", "okrs"],
  kpi: ["kpi", "kpis"],
  leadership: ["leadership", "leading"],
  mentoring: ["mentoring", "mentorship"],
  communication: ["communication"],
  collaboration: ["collaboration", "cross-functional"],
  "project management": ["project management"],
  testing: ["testing", "unit testing", "integration testing"],
  tdd: ["tdd", "test-driven development"],
  bdd: ["bdd", "behavior-driven development"],
  "code review": ["code review", "code reviews"],
  documentation: ["documentation"],
};

const KEYWORDS = Object.keys(KEYWORD_ALIASES);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordPattern(alias: string): RegExp {
  return new RegExp(
    `(^|[^a-z0-9+#.])${escapeRegExp(alias)}([^a-z0-9+#.]|$)`,
    "i",
  );
}

/** True when any accepted form of the canonical keyword appears in text. */
export function containsKeyword(text: string, keyword: string): boolean {
  const aliases = KEYWORD_ALIASES[keyword] ?? [keyword];
  return aliases.some((alias) => keywordPattern(alias).test(text));
}

function keywordsInText(text: string): string[] {
  const found: string[] = [];
  for (const keyword of KEYWORDS) {
    if (containsKeyword(text, keyword)) found.push(keyword);
  }
  return found;
}

function countKeyword(text: string, keyword: string): number {
  const aliases = KEYWORD_ALIASES[keyword] ?? [keyword];
  return aliases.reduce((total, alias) => {
    const matches = text.match(new RegExp(escapeRegExp(alias), "gi"));
    return total + (matches?.length ?? 0);
  }, 0);
}

export type JdKeywordSets = {
  required: string[];
  preferred: string[];
  all: string[];
  heatmap: Record<string, number>;
  seniority: string;
};

type SectionMode = "required" | "preferred" | "general";

const HEADING_PREFIX = /^\s*(?:#{1,6}\s*|[-*•]\s*|\*{1,2}\s*)?/;
const PREFERRED_HEADING =
  /^(?:nice[- ]to[- ]have(?: skills?)?|preferred(?: qualifications| skills)?|bonus(?: points)?|good to have|desired(?: skills)?|plus(?:es)?)\b/i;
const REQUIRED_HEADING =
  /^(?:requirements?|required(?: skills?)?|must[- ]have|minimum qualifications?|qualifications?|what you.?ll need|what we.?re looking for|skills?(?: required)?)\b/i;
const PREFERRED_INLINE = /(preferred|nice[- ]to[- ]have|bonus|a plus|good to have|desired)/i;

const SENIORITY_PATTERNS: Array<[RegExp, string]> = [
  [/\b(head of|director|vp|vice president)\b/i, "director"],
  [/\bprincipal\b/i, "principal"],
  [/\bstaff\b/i, "staff"],
  [/\b(lead|leader|manager|management)\b/i, "lead"],
  [/\bsenior\b/i, "senior"],
  [/\b(mid[- ]level|intermediate)\b/i, "mid"],
  [/\b(junior|entry[- ]level|graduate|intern)\b/i, "junior"],
];

export function extractJdKeywords(jd: string): JdKeywordSets {
  const required = new Set<string>();
  const preferred = new Set<string>();
  const general = new Set<string>();
  const heatmap: Record<string, number> = {};

  let mode: SectionMode = "general";

  for (const rawLine of jd.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const heading = line.replace(HEADING_PREFIX, "").replace(/\*{1,2}\s*$/, "");
    if (PREFERRED_HEADING.test(heading)) mode = "preferred";
    else if (REQUIRED_HEADING.test(heading)) mode = "required";

    // Headings can carry keywords inline, e.g. "Skills: React, TypeScript".
    const found = keywordsInText(line);
    if (found.length === 0) continue;

    const lineMode: SectionMode = PREFERRED_INLINE.test(line)
      ? "preferred"
      : mode;

    for (const keyword of found) {
      if (lineMode === "required") required.add(keyword);
      else if (lineMode === "preferred") preferred.add(keyword);
      else general.add(keyword);

      heatmap[keyword] = (heatmap[keyword] ?? 0) + countKeyword(line, keyword);
    }
  }

  // If no explicit "required" section exists, treat the general pool as the
  // requirements. If it does exist, general keywords become secondary.
  if (required.size === 0) {
    for (const keyword of general) required.add(keyword);
  } else {
    for (const keyword of general) {
      if (!required.has(keyword)) preferred.add(keyword);
    }
  }

  for (const keyword of required) preferred.delete(keyword);

  const requiredList = Array.from(required).slice(0, 24);
  const preferredList = Array.from(preferred).slice(0, 16);
  const all = [...requiredList, ...preferredList];

  const seniority = SENIORITY_PATTERNS.find(([pattern]) => pattern.test(jd))?.[1] ?? "not specified";

  return {
    required: requiredList,
    preferred: preferredList,
    all,
    heatmap,
    seniority,
  };
}

export function buildResumeText(data: ResumeData): string {
  return [
    data.personal.name,
    data.personal.summary,
    data.personal.location,
    ...data.experience.flatMap((entry) => [
      entry.position,
      entry.company,
      entry.location,
      ...entry.bullets,
      ...entry.technologies,
    ]),
    ...data.education.flatMap((entry) => [entry.degree, entry.field, entry.institution, ...entry.honors]),
    ...data.skills.flatMap((category) => [category.category, ...category.skills]),
    ...data.projects.flatMap((project) => [
      project.name,
      project.role,
      project.description,
      ...project.technologies,
      ...project.highlights,
    ]),
    ...data.certifications.flatMap((certification) => [certification.name, certification.issuer]),
    ...data.languages.map((language) => language.language),
    ...data.publications.flatMap((publication) => [publication.title, publication.publisher, publication.description]),
  ]
    .filter(Boolean)
    .join(" ");
}

export function buildResumeSkillsText(data: ResumeData): string {
  return data.skills
    .flatMap((category) => [category.category, ...category.skills])
    .filter(Boolean)
    .join(" ");
}

export function keywordAliases(keyword: string): string[] {
  return KEYWORD_ALIASES[keyword] ?? [keyword];
}

/**
 * Rough total years of experience from date ranges. Current roles count up to
 * the current year. Missing dates are ignored rather than guessed.
 */
export function estimateYearsOfExperience(data: ResumeData, now = new Date().getFullYear()): number {
  let months = 0;
  for (const entry of data.experience) {
    const start = Number.parseInt(entry.startDate, 10);
    if (!Number.isFinite(start)) continue;
    const end = entry.current ? now : Number.parseInt(entry.endDate, 10);
    if (!Number.isFinite(end) || end < start) continue;
    months += (end - start) * 12;
  }
  return Math.round(months / 12);
}
