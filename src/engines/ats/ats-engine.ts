import type { ResumeData, ATSResult, ATSDeduction, ATSAxis } from "@/types";

const WEAK_VERBS = [
  "was", "were", "been", "being", "had", "has", "have", "did", "does",
  "made", "got", "gone", "came", "took", "put", "set", "let", "gave",
  "worked", "helped", "responsible", "duties", "involved", "participated",
  "assisted", "supported", "handled", "managed", "performed", "provided",
];

const LONG_PARAGRAPH_THRESHOLD = 150;

/** Repeated per-bullet findings are capped so a long CV cannot tank the score. */
const MAX_BULLET_PENALTY = 6;

/**
 * Analyzes all bullets at once and aggregates repeated findings into single
 * deductions — one card per issue with affected counts, instead of one card
 * per bullet (which flooded the panel with identical "No Metrics" entries).
 */
function analyzeBullets(bullets: string[]): ATSDeduction[] {
  const deductions: ATSDeduction[] = [];
  const total = bullets.filter((b) => b.trim()).length;
  if (total === 0) return deductions;

  let noMetric = 0;
  let longParagraphs = 0;
  const weakVerbs: string[] = [];

  for (const bullet of bullets) {
    const trimmed = bullet.trim();
    if (!trimmed) continue;

    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
    if (firstWord && WEAK_VERBS.includes(firstWord)) weakVerbs.push(firstWord);
    if (trimmed.length > LONG_PARAGRAPH_THRESHOLD) longParagraphs++;
    if (!/[0-9]/.test(trimmed)) noMetric++;
  }

  if (weakVerbs.length > 0) {
    const examples = [...new Set(weakVerbs)].slice(0, 3).join(", ");
    deductions.push({
      category: "Weak Verbs",
      axis: "impact",
      points: Math.min(weakVerbs.length * 2, MAX_BULLET_PENALTY),
      reason: `${weakVerbs.length} of ${total} bullets start with weak verbs (${examples}${weakVerbs.length > 3 ? ", …" : ""}). Lead with strong action verbs instead.`,
      severity: "medium",
    });
  }

  if (longParagraphs > 0) {
    deductions.push({
      category: "Long Paragraph",
      axis: "brevity",
      points: Math.min(longParagraphs * 3, MAX_BULLET_PENALTY),
      reason: `${longParagraphs} of ${total} bullets exceed ${LONG_PARAGRAPH_THRESHOLD} characters. Break them into shorter, scannable points.`,
      severity: "medium",
    });
  }

  if (noMetric > 0) {
    deductions.push({
      category: "No Metrics",
      axis: "impact",
      points: Math.min(noMetric, MAX_BULLET_PENALTY),
      reason: `${noMetric} of ${total} bullets lack measurable achievements. Add numbers, percentages, or quantifiable results.`,
      severity: "low",
    });
  }

  return deductions;
}

function analyzeSectionOrder(data: ResumeData): ATSDeduction[] {
  const deductions: ATSDeduction[] = [];
  const hasExperience = data.experience.length > 0;
  const hasEducation = data.education.length > 0;
  const hasSkills = data.skills.length > 0;

  if (!hasExperience) {
    deductions.push({
      category: "Missing Section",
      axis: "content",
      points: 10,
      reason: "No experience section found. Experience is critical for ATS ranking.",
      severity: "high",
    });
  }

  if (!hasSkills) {
    deductions.push({
      category: "Missing Section",
      axis: "ats",
      points: 8,
      reason: "No skills section found. Skills help match with job requirements.",
      severity: "high",
    });
  }

  if (!hasEducation) {
    deductions.push({
      category: "Missing Section",
      axis: "content",
      points: 5,
      reason: "No education section found.",
      severity: "medium",
    });
  }

  return deductions;
}

function analyzeFormatting(data: ResumeData): ATSDeduction[] {
  const deductions: ATSDeduction[] = [];

  if (!data.personal.name) {
    deductions.push({
      category: "Formatting",
      axis: "format",
      points: 15,
      reason: "Name is missing. This is critical for ATS identification.",
      severity: "high",
    });
  }

  if (!data.personal.email) {
    deductions.push({
      category: "Formatting",
      axis: "format",
      points: 5,
      reason: "Email is missing. Recruiters cannot contact you.",
      severity: "high",
    });
  }

  const totalBullets = data.experience.reduce((sum, e) => sum + e.bullets.filter(Boolean).length, 0);
  if (totalBullets === 0 && data.experience.length > 0) {
    deductions.push({
      category: "Bullet Quality",
      axis: "content",
      points: 10,
      reason: "Experience entries have no bullet points. Add achievements and responsibilities.",
      severity: "high",
    });
  }

  const emptySections = [
    !data.personal.summary,
    data.experience.length === 0,
    data.education.length === 0,
    data.skills.length === 0,
  ].filter(Boolean).length;

  if (emptySections >= 3) {
    deductions.push({
      category: "Incomplete",
      axis: "content",
      points: 10,
      reason: "Resume is largely empty. Fill in multiple sections to improve ATS score.",
      severity: "high",
    });
  }

  return deductions;
}

const AXIS_LABELS: Record<ATSAxis["id"], { label: string; description: string; max: number }> = {
  content: { label: "Content",  description: "Sections, completeness & required fields", max: 35 },
  format:  { label: "Format",   description: "Identifiable structure & required contact info", max: 25 },
  ats:     { label: "ATS",      description: "Skills, keywords & machine-readability", max: 18 },
  brevity: { label: "Brevity",  description: "Bullet length & scannability", max: 12 },
  impact:  { label: "Impact",   description: "Action verbs & quantifiable metrics", max: 10 },
};

function buildAxes(deductions: ATSDeduction[]): ATSAxis[] {
  const grouped: Record<ATSAxis["id"], number> = {
    content: 0, format: 0, ats: 0, brevity: 0, impact: 0,
  };
  for (const d of deductions) grouped[d.axis] = (grouped[d.axis] ?? 0) + d.points;

  return (Object.keys(AXIS_LABELS) as ATSAxis["id"][]).map((id) => {
    const meta = AXIS_LABELS[id];
    const lost = Math.min(grouped[id] ?? 0, meta.max);
    return {
      id,
      label: meta.label,
      description: meta.description,
      score: Math.max(0, Math.round(((meta.max - lost) / meta.max) * 100)),
    };
  });
}

export function calculateATSScore(data: ResumeData): ATSResult {
  const deductions: ATSDeduction[] = [];
  let score = 100;

  const allBullets = data.experience.flatMap((exp) => exp.bullets);
  const bulletDeductions = analyzeBullets(allBullets);
  const sectionDeductions = analyzeSectionOrder(data);
  const formattingDeductions = analyzeFormatting(data);

  deductions.push(...bulletDeductions, ...sectionDeductions, ...formattingDeductions);

  const totalDeductions = deductions.reduce((sum, d) => sum + d.points, 0);
  score = Math.max(0, 100 - totalDeductions);

  const axes = buildAxes(deductions);

  const recommendations: string[] = [];

  if (deductions.some((d) => d.category === "Weak Verbs")) {
    recommendations.push("Replace weak verbs with strong action verbs like 'Engineered', 'Architected', 'Optimized'");
  }
  if (deductions.some((d) => d.category === "No Metrics")) {
    recommendations.push("Add quantifiable achievements (e.g., 'Reduced latency by 40%', 'Managed 50+ microservices')");
  }
  if (deductions.some((d) => d.category === "Missing Section")) {
    recommendations.push("Add missing sections to improve keyword matching with job descriptions");
  }
  if (!data.personal.summary) {
    recommendations.push("Add a professional summary to give ATS systems context about your profile");
  }
  if (deductions.filter((d) => d.points >= 10).length > 0) {
    recommendations.push("Try the writing helpers to strengthen bullet points with specific actions and results");
  }

  return { score, axes, deductions, recommendations };
}

export function getATSScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 60) return { label: "Good", color: "text-yellow-600" };
  if (score >= 40) return { label: "Needs Work", color: "text-orange-600" };
  return { label: "Poor", color: "text-red-600" };
}
