import type { ResumeData, ATSResult, ATSDeduction, KeywordMatch } from "@/types";

const WEAK_VERBS = [
  "was", "were", "been", "being", "had", "has", "have", "did", "does",
  "made", "got", "gone", "came", "took", "put", "set", "let", "gave",
  "worked", "helped", "responsible", "duties", "involved", "participated",
  "assisted", "supported", "handled", "managed", "performed", "provided",
];

const LONG_PARAGRAPH_THRESHOLD = 150;

function extractKeywords(data: ResumeData): string[] {
  const keywords = new Set<string>();

  for (const exp of data.experience) {
    for (const bullet of exp.bullets) {
      const words = bullet.toLowerCase().split(/[\s,;.()]+/);
      for (const word of words) {
        if (word.length > 2 && !WEAK_VERBS.includes(word)) {
          keywords.add(word);
        }
      }
    }
    for (const tech of exp.technologies) {
      keywords.add(tech.toLowerCase());
    }
  }

  for (const cat of data.skills) {
    for (const skill of cat.skills) {
      keywords.add(skill.toLowerCase());
    }
  }

  for (const proj of data.projects) {
    for (const tech of proj.technologies) {
      keywords.add(tech.toLowerCase());
    }
  }

  return Array.from(keywords);
}

function analyzeBullets(bullets: string[]): ATSDeduction[] {
  const deductions: ATSDeduction[] = [];

  for (const bullet of bullets) {
    const words = bullet.split(/\s+/);
    const firstWord = words[0]?.toLowerCase();

    if (firstWord && WEAK_VERBS.includes(firstWord)) {
      deductions.push({
        category: "Weak Verbs",
        points: 2,
        reason: `Bullet starts with weak verb "${firstWord}". Use stronger action verbs.`,
        severity: "medium",
      });
    }

    if (bullet.length > LONG_PARAGRAPH_THRESHOLD) {
      deductions.push({
        category: "Long Paragraph",
        points: 3,
        reason: "Bullet is too long (over 150 chars). Break into shorter points.",
        severity: "medium",
      });
    }

    if (!bullet.match(/^\d/) && !bullet.match(/[0-9]/)) {
      deductions.push({
        category: "No Metrics",
        points: 1,
        reason: "Bullet lacks measurable achievements. Add numbers, percentages, or quantifiable results.",
        severity: "low",
      });
    }
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
      points: 10,
      reason: "No experience section found. Experience is critical for ATS ranking.",
      severity: "high",
    });
  }

  if (!hasSkills) {
    deductions.push({
      category: "Missing Section",
      points: 8,
      reason: "No skills section found. Skills help match with job requirements.",
      severity: "high",
    });
  }

  if (!hasEducation) {
    deductions.push({
      category: "Missing Section",
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
      points: 15,
      reason: "Name is missing. This is critical for ATS identification.",
      severity: "high",
    });
  }

  if (!data.personal.email) {
    deductions.push({
      category: "Formatting",
      points: 5,
      reason: "Email is missing. Recruiters cannot contact you.",
      severity: "high",
    });
  }

  const totalBullets = data.experience.reduce((sum, e) => sum + e.bullets.filter(Boolean).length, 0);
  if (totalBullets === 0 && data.experience.length > 0) {
    deductions.push({
      category: "Bullet Quality",
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
      points: 10,
      reason: "Resume is largely empty. Fill in multiple sections to improve ATS score.",
      severity: "high",
    });
  }

  return deductions;
}

export function calculateATSScore(data: ResumeData): ATSResult {
  const deductions: ATSDeduction[] = [];
  let score = 100;

  const bulletDeductions = data.experience.flatMap((exp) => analyzeBullets(exp.bullets));
  const sectionDeductions = analyzeSectionOrder(data);
  const formattingDeductions = analyzeFormatting(data);

  deductions.push(...bulletDeductions, ...sectionDeductions, ...formattingDeductions);

  const totalDeductions = deductions.reduce((sum, d) => sum + d.points, 0);
  score = Math.max(0, 100 - totalDeductions);

  const keywords = extractKeywords(data);
  const keywordMatch: KeywordMatch[] = keywords.slice(0, 20).map((kw) => ({
    keyword: kw,
    found: true,
    count: 1,
    importance: "important",
  }));

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
    recommendations.push("Consider using CareerForge AI's AI Assistant to improve your bullet points");
  }

  return { score, deductions, recommendations, keywordMatch };
}

export function getATSScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excellent", color: "text-green-600" };
  if (score >= 60) return { label: "Good", color: "text-yellow-600" };
  if (score >= 40) return { label: "Needs Work", color: "text-orange-600" };
  return { label: "Poor", color: "text-red-600" };
}
