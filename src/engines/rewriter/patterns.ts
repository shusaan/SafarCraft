/**
 * Bullet Patterns Rewriter
 * Declarative pattern list — easy for contributors to extend.
 * Each pattern: regex → replacement. Order matters (first match wins).
 */

export interface RewriterPattern {
  name: string;
  match: RegExp;
  rewrite: string | ((match: RegExpMatchArray) => string);
}

export const REWRITER_PATTERNS: RewriterPattern[] = [
  { name: "Was responsible for", match: /^was responsible for\s+/i, rewrite: "Owned " },
  { name: "Were responsible for", match: /^were responsible for\s+/i, rewrite: "Owned " },
  { name: "Responsible for", match: /^responsible for\s+/i, rewrite: "Owned " },
  { name: "Was in charge of", match: /^was in charge of\s+/i, rewrite: "Led " },
  { name: "In charge of", match: /^in charge of\s+/i, rewrite: "Led " },
  { name: "Worked on", match: /^worked on\s+/i, rewrite: "Engineered " },
  { name: "Was tasked with", match: /^was tasked with\s+/i, rewrite: "Spearheaded " },
  { name: "Tasked with", match: /^tasked with\s+/i, rewrite: "Spearheaded " },
  { name: "Helped with", match: /^helped with\s+/i, rewrite: "Drove " },
  { name: "Helped", match: /^helped\s+/i, rewrite: "Drove " },
  { name: "Was part of team", match: /^was part of (?:a )?team that\s+/i, rewrite: "Contributed to " },
  { name: "Made", match: /^made\s+/i, rewrite: "Built " },
  { name: "Did", match: /^did\s+/i, rewrite: "Executed " },
  { name: "Got", match: /^got\s+/i, rewrite: "Achieved " },
  { name: "Used to", match: /^used to\s+/i, rewrite: "Leveraged to " },
  { name: "Used", match: /^used\s+/i, rewrite: "Leveraged " },
  { name: "Performed", match: /^performed\s+/i, rewrite: "Executed " },
  { name: "Provided", match: /^provided\s+/i, rewrite: "Delivered " },
  { name: "Assisted", match: /^assisted\s+/i, rewrite: "Supported " },
  { name: "Handled", match: /^handled\s+/i, rewrite: "Owned " },
  { name: "Managed", match: /^managed\s+/i, rewrite: "Directed " },
  { name: "Took part in", match: /^took part in\s+/i, rewrite: "Contributed to " },
];

export function detectWeakPatterns(text: string): RewriterPattern[] {
  const matches: RewriterPattern[] = [];
  for (const pattern of REWRITER_PATTERNS) {
    if (pattern.match.test(text.trim())) {
      matches.push(pattern);
    }
  }
  return matches;
}

export function applyPatterns(text: string): string {
  const trimmed = text.trim();
  for (const pattern of REWRITER_PATTERNS) {
    if (pattern.match.test(trimmed)) {
      const replaced = trimmed.replace(pattern.match, typeof pattern.rewrite === "string" ? pattern.rewrite : pattern.rewrite(trimmed.match(pattern.match)!));
      return replaced.charAt(0).toUpperCase() + replaced.slice(1);
    }
  }
  return trimmed;
}
