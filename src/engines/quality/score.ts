/**
 * Resume Quality Score
 * 5 axes: Content, Format, ATS, Brevity, Impact — each 0-100 with actionable fixes.
 */

import type { ResumeData } from "@/types";

export type AxisKey = "content" | "format" | "ats" | "brevity" | "impact";

export interface AxisScore {
  key: AxisKey;
  label: string;
  score: number;
  max: number;
  fixes: string[];
}

export interface QualityResult {
  overall: number;
  axes: AxisScore[];
}

const SCORE_GOOD = 80;
const SCORE_OK = 60;

export function calculateQuality(data: ResumeData): QualityResult {
  const content = scoreContent(data);
  const format = scoreFormat(data);
  const ats = scoreATS(data);
  const brevity = scoreBrevity(data);
  const impact = scoreImpact(data);

  const overall = Math.round((content.score + format.score + ats.score + brevity.score + impact.score) / 5);

  return { overall, axes: [content, format, ats, brevity, impact] };
}

function scoreContent(data: ResumeData): AxisScore {
  const fixes: string[] = [];
  let score = 100;

  if (!data.personal.name) {
    fixes.push("Add your name");
    score -= 20;
  }
  if (!data.personal.email) {
    fixes.push("Add an email address");
    score -= 15;
  }
  if (!data.personal.summary || data.personal.summary.trim().length < 40) {
    fixes.push("Write a 2-4 sentence professional summary (40+ chars)");
    score -= 15;
  }
  if (data.experience.length === 0) {
    fixes.push("Add at least one work experience entry");
    score -= 20;
  }
  if (data.education.length === 0 && data.experience.length === 0) {
    fixes.push("Add education OR work experience");
    score -= 10;
  }
  if (data.skills.length === 0) {
    fixes.push("Add a skills section");
    score -= 10;
  }

  return { key: "content", label: "Content", score: Math.max(0, score), max: 100, fixes };
}

function scoreFormat(data: ResumeData): AxisScore {
  const fixes: string[] = [];
  let score = 100;

  const allBullets = data.experience.flatMap((e) => e.bullets);
  if (allBullets.some((b) => b.length > 250)) {
    fixes.push("Trim bullets over 250 characters");
    score -= 10;
  }

  const dates = data.experience.map((e) => ({ start: e.startDate, end: e.endDate, current: e.current }));
  if (dates.some((d) => !d.start || (!d.current && !d.end))) {
    fixes.push("Fill in start/end dates for every experience entry");
    score -= 15;
  }

  if (data.experience.length > 0 && data.experience.every((e) => e.bullets.length < 2)) {
    fixes.push("Add 2+ bullets per experience entry");
    score -= 10;
  }

  if (data.personal.summary && data.personal.summary.length > 600) {
    fixes.push("Shorten summary to under 600 characters");
    score -= 5;
  }

  return { key: "format", label: "Format", score: Math.max(0, score), max: 100, fixes };
}

function scoreATS(data: ResumeData): AxisScore {
  const fixes: string[] = [];
  let score = 100;

  const contactParts = [data.personal.email, data.personal.phone, data.personal.linkedin, data.personal.github].filter(Boolean).length;
  if (contactParts < 3) {
    fixes.push("Add at least 3 contact methods (email/phone/LinkedIn/GitHub)");
    score -= 15;
  }

  if (!data.personal.linkedin && !data.personal.github) {
    fixes.push("Add LinkedIn or GitHub URL (engineers expect it)");
    score -= 10;
  }

  const allBullets = data.experience.flatMap((e) => e.bullets);
  if (allBullets.length < 3) {
    fixes.push("Add 3+ total bullets across experience");
    score -= 10;
  }

  return { key: "ats", label: "ATS", score: Math.max(0, score), max: 100, fixes };
}

function scoreBrevity(data: ResumeData): AxisScore {
  const fixes: string[] = [];
  let score = 100;

  const allBullets = data.experience.flatMap((e) => e.bullets).filter(Boolean);

  if (allBullets.length > 25) {
    fixes.push(`Trim to under 25 bullets (currently ${allBullets.length})`);
    score -= 15;
  }

  if (allBullets.some((b) => b.length < 30)) {
    fixes.push("Expand short bullets (< 30 chars)");
    score -= 10;
  }

  if (allBullets.some((b) => b.length > 200)) {
    fixes.push("Shorten very long bullets (> 200 chars)");
    score -= 10;
  }

  return { key: "brevity", label: "Brevity", score: Math.max(0, score), max: 100, fixes };
}

function scoreImpact(data: ResumeData): AxisScore {
  const fixes: string[] = [];
  let score = 100;

  const allBullets = data.experience.flatMap((e) => e.bullets).filter(Boolean);
  if (allBullets.length === 0) {
    return { key: "impact", label: "Impact", score: 0, max: 100, fixes: ["Add experience bullets"] };
  }

  const withMetric = allBullets.filter((b) => /\d/.test(b)).length;
  const metricRatio = withMetric / allBullets.length;
  if (metricRatio < 0.5) {
    fixes.push(`Only ${Math.round(metricRatio * 100)}% of bullets have a number — aim for 50%+`);
    score -= 25;
  } else if (metricRatio < 0.75) {
    fixes.push(`${Math.round(metricRatio * 100)}% of bullets have a number — push to 75%+`);
    score -= 10;
  }

  const weak = allBullets.filter((b) => /^(was|were|had|has|have|did|made|got|worked|helped|responsible|handled|performed|provided|assisted|supported)\b/i.test(b.trim()));
  if (weak.length > 0) {
    fixes.push(`${weak.length} bullets start with a weak verb — use Quick Actions to swap`);
    score -= Math.min(20, weak.length * 4);
  }

  return { key: "impact", label: "Impact", score: Math.max(0, score), max: 100, fixes };
}

export function axisColor(score: number): string {
  if (score >= SCORE_GOOD) return "text-green-600 dark:text-green-400";
  if (score >= SCORE_OK) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

export function axisBg(score: number): string {
  if (score >= SCORE_GOOD) return "bg-green-500";
  if (score >= SCORE_OK) return "bg-amber-500";
  return "bg-red-500";
}
