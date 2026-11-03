import type {
  ResumeData,
  ATSResult,
  ATSDeduction,
  ATSAxis,
  ATSAxisId,
  ATSJobMatch,
} from "@/types";
import {
  buildResumeSkillsText,
  buildResumeText,
  containsKeyword,
  estimateYearsOfExperience,
  extractJdKeywords,
} from "./keywords";

const AXIS_META: Record<ATSAxisId, { label: string; description: string; weight: number }> = {
  contact: {
    label: "Contact & Identity",
    description: "Name, email, phone, location, and professional links",
    weight: 0.2,
  },
  experience: {
    label: "Experience",
    description: "Roles, dates, summaries, and enough detail per role",
    weight: 0.25,
  },
  impact: {
    label: "Impact & Clarity",
    description: "Action verbs, measurable results, and scannable achievements",
    weight: 0.3,
  },
  skills: {
    label: "Skills & Evidence",
    description: "Grouped skills that are specific enough to be searched",
    weight: 0.15,
  },
  format: {
    label: "Format & Concision",
    description: "Bullet length, volume, and summary length",
    weight: 0.1,
  },
};

const WEAK_VERBS = new Set([
  "was", "were", "been", "being", "had", "has", "have", "did", "does",
  "made", "got", "gone", "came", "took", "put", "set", "let", "gave",
  "worked", "helped", "responsible", "duties", "involved", "participated",
  "assisted", "supported", "handled", "performed", "provided",
]);


type DeductionInput = Omit<ATSDeduction, "id">;

function addDeduction(list: ATSDeduction[], input: DeductionInput): void {
  list.push({ id: `${input.axis}-${list.length}`, ...input });
}

/** Counts results, not incidental dates or version numbers. */
function hasMetric(text: string): boolean {
  const cleaned = text
    .replace(/\b(19|20)\d{2}\b/g, " ")
    .replace(/\b\d{4}[-/]\d{2}([-/]\d{2})?\b/g, " ")
    .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/gi, " ");

  return (
    /(?:\d+(?:\.\d+)?\s*%|[$£€]\s*\d)/i.test(cleaned) ||
    /\b\d[\d,.]*\s*(?:k|m|b|million|billion|thousand|users|customers|teams|engineers|people|clients|projects|req\/s|requests|transactions|hours|days|weeks|months|points)\b/i.test(cleaned) ||
    /\b(?:reduced|increased|improved|cut|saved|grew|raised|lowered|accelerated)\b[^.]*\b\d/i.test(cleaned) ||
    /\b\d+\s*(?:x|×)\b/i.test(cleaned)
  );
}

function firstWord(text: string): string {
  return text.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";
}

function analyzeContact(data: ResumeData, deductions: ATSDeduction[]): void {
  const { name, email, phone, location, linkedin, github, website } = data.personal;

  if (!name.trim()) {
    addDeduction(deductions, {
      category: "Missing Name",
      axis: "contact",
      points: 40,
      reason: "Recruiters and parsers cannot identify the resume owner.",
      evidence: "The name field is empty.",
      fix: "Add your full name in Personal Info.",
      severity: "high",
    });
  }

  if (!email.trim()) {
    addDeduction(deductions, {
      category: "Missing Email",
      axis: "contact",
      points: 30,
      reason: "There is no direct way to contact you.",
      evidence: "The email field is empty.",
      fix: "Add a professional email address.",
      severity: "high",
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    addDeduction(deductions, {
      category: "Malformed Email",
      axis: "contact",
      points: 20,
      reason: "The email address does not look valid.",
      evidence: email,
      fix: "Use a standard address such as name@example.com.",
      severity: "high",
    });
  }

  if (!phone.trim()) {
    addDeduction(deductions, {
      category: "Missing Phone",
      axis: "contact",
      points: 15,
      reason: "Some recruiters and parsers require a phone number.",
      evidence: "The phone field is empty.",
      fix: "Add a phone number, or remove the field from the header if you prefer email only.",
      severity: "medium",
    });
  } else if (phone.replace(/\D/g, "").length < 7) {
    addDeduction(deductions, {
      category: "Short Phone Number",
      axis: "contact",
      points: 8,
      reason: "The phone number has too few digits to parse reliably.",
      evidence: phone,
      fix: "Use the full international format, e.g. +1 555 123 4567.",
      severity: "low",
    });
  }

  if (!location.trim()) {
    addDeduction(deductions, {
      category: "Missing Location",
      axis: "contact",
      points: 5,
      reason: "Location helps recruiters filter by market and time zone.",
      evidence: "The location field is empty.",
      fix: "Add your city and country, or 'Remote' if that is your preference.",
      severity: "low",
    });
  }

  if (![linkedin, github, website].some((value) => value.trim())) {
    addDeduction(deductions, {
      category: "No Professional Link",
      axis: "contact",
      points: 10,
      reason: "There is no portfolio, GitHub, or LinkedIn link to verify your work.",
      evidence: "LinkedIn, GitHub, and website are all empty.",
      fix: "Add at least one professional link.",
      severity: "low",
    });
  }
}

function analyzeExperience(data: ResumeData, deductions: ATSDeduction[]): void {
  const summary = data.personal.summary.trim();

  if (!summary) {
    addDeduction(deductions, {
      category: "Missing Summary",
      axis: "experience",
      points: 15,
      reason: "A summary gives the reader context before the role list.",
      evidence: "The professional summary is empty.",
      fix: "Write a 2–4 sentence summary with your role, years, and strongest domain.",
      severity: "medium",
    });
  } else if (summary.length < 40) {
    addDeduction(deductions, {
      category: "Thin Summary",
      axis: "experience",
      points: 8,
      reason: "The summary is too short to add useful context.",
      evidence: summary,
      fix: "Expand the summary to at least 40 characters (ideally 2–3 sentences).",
      severity: "low",
    });
  }

  if (data.experience.length === 0) {
    addDeduction(deductions, {
      category: "Missing Experience",
      axis: "experience",
      points: 60,
      reason: "Experience is the core section recruiters and ATS ranking use.",
      evidence: "No work experience entries.",
      fix: "Add at least one role, internship, freelance project, or relevant volunteer position.",
      severity: "high",
    });
    return;
  }

  const missingCore = data.experience.filter((entry) => !entry.company.trim() || !entry.position.trim());
  if (missingCore.length > 0) {
    addDeduction(deductions, {
      category: "Incomplete Roles",
      axis: "experience",
      points: Math.min(24, missingCore.length * 12),
      reason: "Every role needs a company and a job title to parse correctly.",
      evidence: `${missingCore.length} role(s) are missing a company or title.`,
      fix: "Fill in the company and position for every role.",
      severity: "high",
    });
  }

  const noBullets = data.experience.filter(
    (entry) => entry.bullets.filter((bullet) => bullet.trim()).length === 0,
  );
  if (noBullets.length > 0) {
    addDeduction(deductions, {
      category: "Roles Without Bullets",
      axis: "experience",
      points: Math.min(20, noBullets.length * 10),
      reason: "A role with no achievements gives the reader nothing to evaluate.",
      evidence: `${noBullets.length} role(s) have no bullet points.`,
      fix: "Add 2–4 achievement bullets per role.",
      severity: "high",
    });
  }

  const missingDates = data.experience.filter(
    (entry) => !entry.startDate.trim() || (!entry.current && !entry.endDate.trim()),
  );
  if (missingDates.length > 0) {
    addDeduction(deductions, {
      category: "Missing Dates",
      axis: "experience",
      points: Math.min(15, missingDates.length * 5),
      reason: "Dates are required to establish chronology and seniority.",
      evidence: `${missingDates.length} role(s) have an incomplete date range.`,
      fix: "Add a start date and either an end date or mark the role as current.",
      severity: "medium",
    });
  }

  const thinRoles = data.experience.filter(
    (entry) => entry.bullets.filter((bullet) => bullet.trim()).length < 2,
  );
  if (thinRoles.length > 0) {
    addDeduction(deductions, {
      category: "Thin Role Detail",
      axis: "experience",
      points: Math.min(10, thinRoles.length * 4),
      reason: "One bullet rarely shows enough scope or outcome.",
      evidence: `${thinRoles.length} role(s) have fewer than 2 bullets.`,
      fix: "Add at least 2 bullets per role, focusing on outcome and scale.",
      severity: "low",
    });
  }
}

function analyzeImpact(data: ResumeData, deductions: ATSDeduction[]): void {
  const bullets = data.experience.flatMap((entry) => entry.bullets).filter((bullet) => bullet.trim());
  const total = bullets.length;

  if (total === 0) {
    addDeduction(deductions, {
      category: "No Achievements",
      axis: "impact",
      points: 30,
      reason: "There are no achievement bullets to judge impact or clarity.",
      evidence: "No bullet points across any role.",
      fix: "Add at least 3 achievement bullets with a result or scale.",
      severity: "high",
    });
    return;
  }

  const noMetric = bullets.filter((bullet) => !hasMetric(bullet));
  if (noMetric.length > 0) {
    addDeduction(deductions, {
      category: "No Metrics",
      axis: "impact",
      points: Math.min(20, Math.round((noMetric.length / total) * 20)),
      reason: `${noMetric.length} of ${total} bullets lack a measurable result.`,
      evidence: noMetric[0]?.slice(0, 120) ?? "",
      fix: "Add a number, percentage, scale, or time saved to at least half your bullets.",
      severity: noMetric.length / total >= 0.5 ? "high" : "medium",
    });
  }

  const weakVerbs = bullets.filter((bullet) => WEAK_VERBS.has(firstWord(bullet)));
  if (weakVerbs.length > 0) {
    const examples = [...new Set(weakVerbs.map(firstWord))].slice(0, 3).join(", ");
    addDeduction(deductions, {
      category: "Weak Verbs",
      axis: "impact",
      points: Math.min(15, weakVerbs.length * 3),
      reason: `${weakVerbs.length} of ${total} bullets start with a weak or passive verb (${examples}).`,
      evidence: weakVerbs[0]?.slice(0, 120) ?? "",
      fix: "Start with a strong action verb such as Led, Built, Reduced, Shipped, or Designed.",
      severity: "medium",
    });
  }

  const responsibilityPhrases = bullets.filter((bullet) =>
    /\b(responsible for|duties included|worked on|tasked with)\b/i.test(bullet),
  );
  if (responsibilityPhrases.length > 0) {
    addDeduction(deductions, {
      category: "Responsibility Phrasing",
      axis: "impact",
      points: Math.min(8, responsibilityPhrases.length * 3),
      reason: "Job-description phrasing describes duties instead of outcomes.",
      evidence: responsibilityPhrases[0]?.slice(0, 120) ?? "",
      fix: "Rewrite duties as results: what changed, by how much, and for whom.",
      severity: "low",
    });
  }

  const longBullets = bullets.filter((bullet) => bullet.length > 220);
  if (longBullets.length > 0) {
    addDeduction(deductions, {
      category: "Long Bullets",
      axis: "format",
      points: Math.min(12, longBullets.length * 4),
      reason: `${longBullets.length} bullet(s) exceed 220 characters and are hard to scan.`,
      evidence: longBullets[0]?.slice(0, 120) ?? "",
      fix: "Split long bullets or cut the least relevant detail.",
      severity: "medium",
    });
  }

  const shortBullets = bullets.filter((bullet) => bullet.length < 25);
  if (shortBullets.length > 0) {
    addDeduction(deductions, {
      category: "Thin Bullets",
      axis: "format",
      points: Math.min(6, shortBullets.length * 2),
      reason: `${shortBullets.length} bullet(s) are shorter than 25 characters.`,
      evidence: shortBullets[0] ?? "",
      fix: "Add the action, the work, and the result.",
      severity: "low",
    });
  }
}

function analyzeSkills(data: ResumeData, deductions: ATSDeduction[]): void {
  const totalSkills = data.skills.reduce(
    (sum, category) => sum + category.skills.filter((skill) => skill.trim()).length,
    0,
  );

  if (data.skills.length === 0 || totalSkills === 0) {
    addDeduction(deductions, {
      category: "Missing Skills",
      axis: "skills",
      points: 60,
      reason: "There is no searchable skills section.",
      evidence: "No skill categories or individual skills.",
      fix: "Add 2–4 categories with the tools, languages, and methods you actually use.",
      severity: "high",
    });
    return;
  }

  if (totalSkills < 5) {
    addDeduction(deductions, {
      category: "Few Skills",
      axis: "skills",
      points: 20,
      reason: "A very short skills list gives keyword matching little to work with.",
      evidence: `${totalSkills} skill(s) total.`,
      fix: "List at least 5–8 relevant skills, grouped by category.",
      severity: "medium",
    });
  }

  const emptyCategories = data.skills.filter(
    (category) => category.skills.filter((skill) => skill.trim()).length === 0,
  );
  if (emptyCategories.length > 0) {
    addDeduction(deductions, {
      category: "Empty Skill Groups",
      axis: "skills",
      points: Math.min(12, emptyCategories.length * 6),
      reason: "Empty categories add structure without information.",
      evidence: `${emptyCategories.length} empty category/categories.`,
      fix: "Fill or remove empty skill categories.",
      severity: "low",
    });
  }
}

function analyzeFormat(data: ResumeData, deductions: ATSDeduction[]): void {
  const bullets = data.experience.flatMap((entry) => entry.bullets).filter((bullet) => bullet.trim());

  if (bullets.length > 30) {
    addDeduction(deductions, {
      category: "Too Many Bullets",
      axis: "format",
      points: 15,
      reason: "Very long resumes are harder to scan and often get truncated.",
      evidence: `${bullets.length} bullets across ${data.experience.length} role(s).`,
      fix: "Trim to the strongest 3–5 bullets per recent role and 1–2 for older roles.",
      severity: "medium",
    });
  }

  if (data.personal.summary.length > 600) {
    addDeduction(deductions, {
      category: "Long Summary",
      axis: "format",
      points: 8,
      reason: "The summary is long enough to push experience below the fold.",
      evidence: `${data.personal.summary.length} characters.`,
      fix: "Shorten the summary to under 600 characters.",
      severity: "low",
    });
  }
}

function scoreAxis(id: ATSAxisId, deductions: ATSDeduction[]): number {
  const lost = deductions
    .filter((deduction) => deduction.axis === id)
    .reduce((sum, deduction) => sum + deduction.points, 0);
  return Math.max(0, 100 - Math.min(100, lost));
}

function buildStrengths(data: ResumeData): string[] {
  const strengths: string[] = [];
  const { name, email, phone, location, linkedin, github, website, summary } = data.personal;

  if (name && email && (phone || location)) strengths.push("Core contact details are present");
  if ([linkedin, github, website].some(Boolean)) strengths.push("Professional link included");
  if (summary.trim().length >= 40) strengths.push("Professional summary gives context");

  const bullets = data.experience.flatMap((entry) => entry.bullets).filter((bullet) => bullet.trim());
  if (data.experience.length >= 2) strengths.push("Work history shows progression");
  if (bullets.length >= 3) strengths.push("Experience includes achievement bullets");
  if (bullets.length > 0 && bullets.filter(hasMetric).length / bullets.length >= 0.5) {
    strengths.push("At least half of your bullets include measurable results");
  }
  if (data.skills.reduce((sum, category) => sum + category.skills.length, 0) >= 5) {
    strengths.push("Skills section is searchable and specific");
  }
  if (data.projects.length > 0) strengths.push("Projects provide supporting evidence");
  if (data.certifications.length > 0) strengths.push("Certifications add third-party validation");

  return strengths;
}

export type ReadinessAnalysis = {
  score: number;
  axes: ATSAxis[];
  deductions: ATSDeduction[];
  recommendations: string[];
  strengths: string[];
};

/** Generic, JD-independent resume readiness analysis. */
export function analyzeResumeReadiness(data: ResumeData): ReadinessAnalysis {
  const deductions: ATSDeduction[] = [];

  analyzeContact(data, deductions);
  analyzeExperience(data, deductions);
  analyzeImpact(data, deductions);
  analyzeSkills(data, deductions);
  analyzeFormat(data, deductions);

  const axes: ATSAxis[] = (Object.keys(AXIS_META) as ATSAxisId[]).map((id) => ({
    id,
    label: AXIS_META[id].label,
    description: AXIS_META[id].description,
    weight: AXIS_META[id].weight,
    score: scoreAxis(id, deductions),
  }));

  const score = Math.round(
    axes.reduce((sum, axis) => sum + axis.score * axis.weight, 0),
  );

  const recommendations = Array.from(
    new Set(
      deductions
        .filter((deduction) => deduction.severity !== "low")
        .sort((a, b) => b.points - a.points)
        .map((deduction) => deduction.fix),
    ),
  ).slice(0, 6);

  return { score, axes, deductions, recommendations, strengths: buildStrengths(data) };
}

const SENIORITY_LEVEL: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 3,
  lead: 4,
  staff: 4,
  principal: 5,
  director: 5,
  "not specified": 0,
};

function candidateSeniority(data: ResumeData): number {
  const years = estimateYearsOfExperience(data);
  let level = years < 2 ? 1 : years < 5 ? 2 : years < 8 ? 3 : years < 12 ? 4 : 5;

  const titles = data.experience.map((entry) => entry.position).join(" ").toLowerCase();
  if (/\b(principal|director|head of|vp)\b/.test(titles)) level = Math.max(level, 5);
  else if (/\b(staff|lead|manager)\b/.test(titles)) level = Math.max(level, 4);
  else if (/\bsenior\b/.test(titles)) level = Math.max(level, 3);

  return level;
}

function seniorityFit(jdLevel: string, data: ResumeData): number {
  const target = SENIORITY_LEVEL[jdLevel] ?? 0;
  if (target === 0) return 80;

  const candidate = candidateSeniority(data);
  const diff = candidate - target;
  if (diff === 0) return 100;
  if (diff > 0) return Math.max(70, 100 - diff * 10);
  if (diff === -1) return 65;
  if (diff === -2) return 40;
  return 20;
}

/**
 * JD-aware job match. Required keywords carry half the weight, preferred
 * keywords a quarter, explicit skills overlap 15%, and seniority 10%.
 * Weights are re-normalized when a JD has no preferred or no required terms.
 */
export function analyzeJobMatch(jobDescription: string, data: ResumeData): ATSJobMatch | null {
  const jd = extractJdKeywords(jobDescription);
  if (jd.all.length === 0) return null;

  const resumeText = buildResumeText(data);
  const skillsText = buildResumeSkillsText(data);

  const matchedRequired = jd.required.filter((keyword) => containsKeyword(resumeText, keyword));
  const matchedPreferred = jd.preferred.filter((keyword) => containsKeyword(resumeText, keyword));

  const requiredCoverage = jd.required.length > 0
    ? Math.round((matchedRequired.length / jd.required.length) * 100)
    : 0;
  const preferredCoverage = jd.preferred.length > 0
    ? Math.round((matchedPreferred.length / jd.preferred.length) * 100)
    : 0;

  const skillsOverlap = jd.all.length > 0
    ? Math.round(
        (jd.all.filter((keyword) => containsKeyword(skillsText, keyword)).length / jd.all.length) * 100,
      )
    : 0;

  const fit = seniorityFit(jd.seniority, data);

  let requiredWeight = jd.required.length > 0 ? 0.5 : 0;
  let preferredWeight = jd.preferred.length > 0 ? 0.25 : 0;
  let skillsWeight = 0.15;
  const seniorityWeight = 0.1;
  const totalWeight = requiredWeight + preferredWeight + skillsWeight + seniorityWeight;

  // Re-normalize if one of the JD buckets is empty.
  if (totalWeight !== 1 && totalWeight > 0) {
    requiredWeight /= totalWeight;
    preferredWeight /= totalWeight;
    skillsWeight /= totalWeight;
  }

  const score = Math.round(
    requiredCoverage * requiredWeight +
      preferredCoverage * preferredWeight +
      skillsOverlap * skillsWeight +
      fit * seniorityWeight,
  );

  const matchedKeywords = [...matchedRequired, ...matchedPreferred];
  const missingKeywords = [
    ...jd.required.filter((keyword) => !matchedRequired.includes(keyword)),
    ...jd.preferred.filter((keyword) => !matchedPreferred.includes(keyword)),
  ];

  return {
    score,
    requiredCoverage,
    preferredCoverage,
    skillsOverlap,
    seniorityFit: fit,
    matchedKeywords,
    missingKeywords,
    requiredKeywords: jd.required,
    preferredKeywords: jd.preferred,
    seniority: jd.seniority,
    evidence: jd.all.map((keyword) => ({
      keyword,
      found: containsKeyword(resumeText, keyword),
      required: jd.required.includes(keyword),
    })),
  };
}

export function getATSScoreLabel(
  score: number,
  jobMatch?: ATSJobMatch | null,
): { label: string; color: string } {
  if (jobMatch) {
    if (score >= 80) return { label: "Strong match", color: "text-green-600" };
    if (score >= 65) return { label: "Competitive", color: "text-emerald-600" };
    if (score >= 45) return { label: "Needs targeting", color: "text-amber-600" };
    return { label: "High risk", color: "text-red-600" };
  }

  if (score >= 85) return { label: "Strong foundation", color: "text-green-600" };
  if (score >= 70) return { label: "Solid", color: "text-emerald-600" };
  if (score >= 50) return { label: "Needs work", color: "text-amber-600" };
  return { label: "High risk", color: "text-red-600" };
}

export function calculateATSScore(data: ResumeData, jobDescription?: string | null): ATSResult {
  const readiness = analyzeResumeReadiness(data);
  const jobMatch = jobDescription?.trim()
    ? analyzeJobMatch(jobDescription, data)
    : null;

  const score = jobMatch
    ? Math.round(readiness.score * 0.5 + jobMatch.score * 0.5)
    : readiness.score;

  const recommendations = [...readiness.recommendations];

  if (jobMatch && jobMatch.missingKeywords.length > 0) {
    recommendations.unshift(
      `Add the missing keywords you can honestly claim: ${jobMatch.missingKeywords
        .slice(0, 6)
        .join(", ")}.`,
    );
  }

  return {
    score,
    readinessScore: readiness.score,
    jobMatch,
    axes: readiness.axes,
    deductions: readiness.deductions,
    recommendations: recommendations.slice(0, 6),
    strengths: readiness.strengths,
    label: getATSScoreLabel(score, jobMatch),
  };
}
