/**
 * Resume Quality Score
 *
 * Thin presentation adapter over the ATS readiness engine. ATS and Quality must
 * agree, so there is exactly one scoring implementation.
 */

import type { ATSAxisId, ResumeData } from "@/types";
import { analyzeResumeReadiness } from "@/engines/ats/ats-engine";

export type AxisKey = ATSAxisId;

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
  const readiness = analyzeResumeReadiness(data);

  return {
    overall: readiness.score,
    axes: readiness.axes.map((axis) => ({
      key: axis.id,
      label: axis.label,
      score: axis.score,
      max: 100,
      fixes: readiness.deductions
        .filter((deduction) => deduction.axis === axis.id)
        .map((deduction) => deduction.fix),
    })),
  };
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
