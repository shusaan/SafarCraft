/**
 * Summary Builder
 * Generates a 2-4 sentence professional summary from user inputs.
 * Pure template concatenation — no LLM.
 */

export interface SummaryInput {
  role: string;
  yearsExperience: number;
  topSkills: string[];
  targetType: "startup" | "faang" | "government" | "academia" | "general";
  highlights?: string[];
}

const HOOKS: Record<SummaryInput["targetType"], string> = {
  startup: "Hands-on",
  faang: "Results-driven",
  government: "Mission-driven",
  academia: "Research-focused",
  general: "Dedicated",
};

const SCALE: Record<SummaryInput["targetType"], string> = {
  startup: "shipping fast in small, cross-functional teams",
  faang: "operating at scale across large systems and orgs",
  government: "delivering reliable, compliant systems for public impact",
  academia: "advancing knowledge through rigorous methodology and publication",
  general: "delivering impact across teams and stakeholders",
};

export function buildSummary(input: SummaryInput): string {
  const skills = input.topSkills.filter(Boolean).slice(0, 3);
  const skillsPhrase = skills.length === 0
    ? "modern software engineering"
    : skills.length === 1
      ? skills[0]!
      : `${skills.slice(0, -1).join(", ")} and ${skills[skills.length - 1]}`;

  const hook = HOOKS[input.targetType];
  const scale = SCALE[input.targetType];
  const years = input.yearsExperience > 0 ? `${input.yearsExperience}+ years of experience` : "experience";

  const lead = `${hook} ${input.role || "engineer"} with ${years} in ${skillsPhrase}, ${scale}.`;

  let mid = "";
  if (input.highlights && input.highlights.length > 0) {
    const cleaned = input.highlights.filter(Boolean).slice(0, 2);
    if (cleaned.length === 1) {
      mid = ` Notable work: ${cleaned[0]}.`;
    } else if (cleaned.length === 2) {
      mid = ` Notable work: ${cleaned[0]} and ${cleaned[1]}.`;
    }
  }

  const closer = "Looking for a role where I can compound those strengths.";

  return `${lead}${mid} ${closer}`.trim();
}
