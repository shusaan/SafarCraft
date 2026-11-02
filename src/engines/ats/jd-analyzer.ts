import type { JDParseResult, ResumeData } from "@/types";
import { analyzeJobMatch } from "./ats-engine";
import { extractJdKeywords } from "./keywords";

export function analyzeJobDescription(jd: string, resume: ResumeData): JDParseResult {
  const sets = extractJdKeywords(jd);
  const match = analyzeJobMatch(jd, resume);

  const matchedSkills = match?.matchedKeywords ?? [];
  const missingSkills = match?.missingKeywords ?? [];
  const matchScore = match?.score ?? 0;
  const experienceLevel = sets.seniority;

  const responsibilities: string[] = [];
  for (const line of jd.split("\n")) {
    const trimmed = line.trim().replace(/^[-*•]\s*/, "");
    if (trimmed.length > 20 && trimmed.length < 200 && !trimmed.startsWith("http")) {
      responsibilities.push(trimmed);
    }
  }

  const suggestions: string[] = [];
  if (missingSkills.length > 0) {
    suggestions.push(`Add missing keywords you can honestly claim: ${missingSkills.slice(0, 8).join(", ")}`);
  }
  if (experienceLevel !== "not specified") {
    suggestions.push(`Tailor the summary and recent roles to a "${experienceLevel}" level role.`);
  }
  if (matchScore < 50 && sets.all.length > 0) {
    suggestions.push("Rewrite the summary and top bullets around the JD's required outcomes, not just its tools.");
  }
  if (sets.all.length === 0) {
    suggestions.push("No recognizable skills were found. Paste the full job description, including requirements.");
  }

  return {
    skills: matchedSkills,
    technologies: matchedSkills,
    jdSkills: sets.all,
    responsibilities: responsibilities.slice(0, 10),
    experienceLevel,
    matchScore,
    missingSkills,
    suggestions,
    keywordHeatmap: sets.heatmap,
    requiredSkills: sets.required,
    preferredSkills: sets.preferred,
    requiredCoverage: match?.requiredCoverage,
    preferredCoverage: match?.preferredCoverage,
    skillsOverlap: match?.skillsOverlap,
    seniorityFit: match?.seniorityFit,
  };
}
