import type { JDParseResult } from "@/types";
import type { ResumeData } from "@/types";

const TECH_KEYWORDS = [
  "react", "angular", "vue", "node", "typescript", "javascript", "python", "java",
  "go", "rust", "c++", "sql", "postgresql", "mysql", "mongodb", "redis", "docker",
  "kubernetes", "aws", "gcp", "azure", "terraform", "ansible", "ci/cd", "git",
  "linux", "rest", "graphql", "microservices", "serverless", "agile", "scrum",
  "machine learning", "ai", "data", "api", "frontend", "backend", "fullstack",
  "devops", "sre", "cloud", "security", "testing", "monitoring", "observability",
];

export function analyzeJobDescription(jd: string, resume: ResumeData): JDParseResult {
  const lowerJD = jd.toLowerCase();

  const foundSkills = TECH_KEYWORDS.filter((kw) => lowerJD.includes(kw));
  const allResumeText = [
    ...resume.experience.flatMap((e) => [e.position, e.company, ...e.bullets, ...e.technologies]),
    ...resume.education.flatMap((e) => [e.degree, e.field, e.institution]),
    ...resume.skills.flatMap((c) => [c.category, ...c.skills]),
    ...resume.projects.flatMap((p) => [p.name, p.description, ...p.technologies]),
    ...resume.certifications.flatMap((c) => [c.name, c.issuer]),
    ...resume.languages.map((l) => l.language),
    resume.personal.summary,
  ]
    .join(" ")
    .toLowerCase();

  const missingSkills = foundSkills.filter((skill) => !allResumeText.includes(skill));

  const experienceLevels = ["junior", "mid-level", "senior", "staff", "principal", "lead"];
  const experienceLevel = experienceLevels.find((level) => lowerJD.includes(level)) ?? "Not specified";

  const responsibilities: string[] = [];
  const lines = jd.split("\n");
  for (const line of lines) {
    const trimmed = line.trim().replace(/^[-*•]\s*/, "");
    if (trimmed.length > 20 && trimmed.length < 200 && !trimmed.startsWith("http")) {
      responsibilities.push(trimmed);
    }
  }

  const matchScore = foundSkills.length > 0
    ? Math.round(((foundSkills.length - missingSkills.length) / foundSkills.length) * 100)
    : 0;

  const keywordHeatmap: Record<string, number> = {};
  for (const skill of foundSkills) {
    keywordHeatmap[skill] = (lowerJD.match(new RegExp(skill, "g")) ?? []).length;
  }

  const suggestions: string[] = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add missing skills: ${missingSkills.slice(0, 8).join(", ")}`);
  }
  if (experienceLevel !== "Not specified") {
    suggestions.push(`Tailor experience level to "${experienceLevel}" role`);
  }
  if (matchScore < 50) {
    suggestions.push("Consider adding more relevant technologies from the job description");
  }

  return {
    skills: foundSkills,
    technologies: foundSkills,
    responsibilities: responsibilities.slice(0, 10),
    experienceLevel,
    matchScore,
    missingSkills,
    suggestions,
    keywordHeatmap,
  };
}
