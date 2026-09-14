/**
 * JD Tailoring Engine
 * Extract keywords from JD, match against resume, find gaps, suggest rephrasing.
 */

import type { ResumeData } from "@/types";

export interface TailorResult {
  jdKeywords: string[];
  matched: string[];
  missing: string[];
  matchScore: number;
  rephraseSuggestions: RephraseSuggestion[];
}

export interface RephraseSuggestion {
  resumeKeyword: string;
  jdKeyword: string;
  bullet?: string;
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he", "in", "is", "it",
  "its", "of", "on", "that", "the", "to", "was", "were", "will", "with", "you", "your", "i",
  "we", "our", "us", "they", "their", "them", "this", "these", "those", "or", "but", "if",
  "than", "then", "so", "very", "can", "should", "would", "could", "may", "might", "must",
  "shall", "having", "having", "about", "into", "out", "up", "down", "over", "under", "more",
  "less", "some", "any", "all", "most", "many", "much", "few", "such", "no", "not", "only",
  "own", "same", "other", "another", "also", "just", "still", "now", "here", "there", "where",
  "when", "what", "which", "who", "whom", "whose", "why", "how", "both", "each", "every",
  "either", "neither", "one", "two", "three", "first", "second", "last", "next", "previous",
  "new", "old", "good", "great", "best", "better", "well", "high", "low", "large", "small",
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w+#.\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function extractKeywords(jdText: string): string[] {
  const tokens = tokenise(jdText);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .filter(([_, n]) => n >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

function buildResumeCorpus(data: ResumeData): string {
  const parts: string[] = [];
  if (data.personal.summary) parts.push(data.personal.summary);
  for (const e of data.experience) {
    parts.push(e.position, e.company);
    parts.push(...e.bullets);
    parts.push(...e.technologies);
  }
  for (const p of data.projects) {
    parts.push(p.name, p.description, ...(p.technologies ?? []));
  }
  for (const s of data.skills) {
    parts.push(s.category, ...s.skills);
  }
  return parts.join(" ").toLowerCase();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }
  return dp[m]![n]!;
}

export function tailorToJD(jdText: string, data: ResumeData): TailorResult {
  const jdKeywords = extractKeywords(jdText);
  const corpus = buildResumeCorpus(data);

  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of jdKeywords) {
    const inCorpus = corpus.includes(kw);
    if (inCorpus) {
      matched.push(kw);
    } else {
      const fuzzy = jdKeywords.find((other) => other !== kw && levenshtein(other, kw) <= 2 && corpus.includes(other));
      if (fuzzy) matched.push(kw);
      else missing.push(kw);
    }
  }

  const matchScore = jdKeywords.length > 0 ? Math.round((matched.length / jdKeywords.length) * 100) : 0;

  const rephraseSuggestions: RephraseSuggestion[] = [];
  const allBullets = data.experience.flatMap((e) => e.bullets.filter(Boolean));
  for (const jdKw of missing.slice(0, 5)) {
    for (const bullet of allBullets) {
      for (const word of tokenise(bullet)) {
        if (Math.abs(word.length - jdKw.length) <= 2 && levenshtein(word, jdKw) <= 1 && word !== jdKw) {
          rephraseSuggestions.push({ resumeKeyword: word, jdKeyword: jdKw, bullet });
          break;
        }
      }
      if (rephraseSuggestions.length >= 3) break;
    }
  }

  return { jdKeywords, matched, missing, matchScore, rephraseSuggestions };
}
