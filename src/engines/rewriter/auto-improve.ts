/**
 * Auto-Improve — one scan across the whole resume that aggregates the
 * existing rewriter engines into a single review list.
 *
 * Two kinds of findings:
 *  - actionable rewrites ("phrase") with a concrete suggested replacement
 *  - advisory hints ("metric", "grammar") the user acts on manually —
 *    numbers and wording choices are never invented automatically
 *
 * Pure functions only — nothing changes until the user applies the
 * selected items, and applied changes go through the normal store update
 * (so undo works).
 */
import type { ResumeData } from "@/types";
import { applyPatterns } from "./patterns";
import { needsMetric, suggestMetricHint, detectCategory as detectMetricCategory } from "./quantifier";
import { checkGrammar } from "@/engines/grammar/checker";

export type ImprovementKind = "phrase" | "metric" | "grammar";

export interface AutoImprovement {
  id: string;
  kind: ImprovementKind;
  /** Where the finding applies. */
  target: "experience" | "summary";
  /** Experience locator — undefined for summary findings. */
  expId?: string;
  bulletIndex?: number;
  label: string;
  original: string;
  /** Actionable rewrites carry the replacement text; advisory hints keep the original. */
  suggested: string;
  hint: string;
}

export const isActionable = (item: AutoImprovement): boolean => item.kind === "phrase";

export function buildAutoImprovements(data: ResumeData): AutoImprovement[] {
  const items: AutoImprovement[] = [];
  let seq = 0;
  const nextId = () => `imp-${++seq}`;

  for (const exp of data.experience) {
    exp.bullets.forEach((bullet, bulletIndex) => {
      const trimmed = bullet.trim();
      if (!trimmed) return;

      // 1. Weak opener phrase → concrete rewrite (actionable).
      const suggested = applyPatterns(trimmed);
      if (suggested !== trimmed) {
        items.push({
          id: nextId(),
          kind: "phrase",
          target: "experience",
          expId: exp.id,
          bulletIndex,
          label: "Weak opener",
          original: bullet,
          suggested,
          hint: "Start with a strong, specific verb instead of a filler phrase.",
        });
        return; // one rewrite per bullet keeps the review focused
      }

      // 2. Missing metric (advisory — numbers are never invented).
      if (needsMetric(trimmed)) {
        items.push({
          id: nextId(),
          kind: "metric",
          target: "experience",
          expId: exp.id,
          bulletIndex,
          label: "Missing metric",
          original: bullet,
          suggested: bullet,
          hint: suggestMetricHint(detectMetricCategory(trimmed)),
        });
      }
    });
  }

  // 3. Summary — grammar/style findings (advisory).
  const summary = data.personal.summary?.trim() ?? "";
  if (summary) {
    for (const issue of checkGrammar(summary)) {
      items.push({
        id: nextId(),
        kind: "grammar",
        target: "summary",
        label:
          issue.kind === "weasel"
            ? "Weasel word"
            : issue.kind === "passive"
              ? "Passive voice"
              : issue.kind === "doubled"
                ? "Doubled word"
                : "Style",
        original: summary,
        suggested: summary,
        hint: issue.message,
      });
    }
  }

  return items;
}

/** Apply the selected actionable rewrites and return the updated resume. */
export function applyAutoImprovements(data: ResumeData, selected: AutoImprovement[]): ResumeData {
  const replacements = new Map(
    selected
      .filter((item) => isActionable(item) && item.expId && item.bulletIndex !== undefined)
      .map((item) => [`${item.expId}:${item.bulletIndex}`, item.suggested] as const),
  );
  if (replacements.size === 0) return data;

  return {
    ...data,
    experience: data.experience.map((exp) => ({
      ...exp,
      bullets: exp.bullets.map((bullet, i) => replacements.get(`${exp.id}:${i}`) ?? bullet),
    })),
  };
}
