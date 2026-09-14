/**
 * Quantification Prompter
 * Flags bullets that lack measurable impact and suggests category-specific metrics.
 */

export type MetricCategory = "performance" | "scale" | "cost" | "team" | "users" | "generic";

const METRIC_PATTERNS: RegExp[] = [
  /%/,
  /\$\s?\d/,
  /\b\d+\s?(?:k|m|ms|s|gb|mb|kb|tb)\b/i,
  /\busers?\b/i,
  /\bteam of\s+\d/i,
  /\bp?\d{2,}\b/,
];

const CATEGORY_KEYWORDS: Record<MetricCategory, RegExp> = {
  performance: /\b(speed|latency|throughput|render|load|response|performance|p99|p95|rps|tps)\b/i,
  scale: /\b(requests|traffic|requests per second|qps|tps|concurrent|scale)\b/i,
  cost: /\b(cost|budget|savings|spend|expense|infrastructure|cloud)\b/i,
  team: /\b(team|engineers|developers|people|reports|members|hired|mentored)\b/i,
  users: /\b(users|customers|clients|tenants|accounts|signups|sign-ups|subscribers)\b/i,
  generic: /.*/,
};

const CATEGORY_HINTS: Record<MetricCategory, string> = {
  performance: "Add a performance metric (e.g., reduced p99 latency by 40%)",
  scale: "Add a scale metric (e.g., handles 10k req/s)",
  cost: "Add a cost metric (e.g., saved $120k/year)",
  team: "Add a team metric (e.g., led team of 6 engineers)",
  users: "Add a user metric (e.g., shipped to 50k users)",
  generic: "Add a measurable metric (%, $, scale, or count)",
};

export function needsMetric(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 12) return false;
  return !METRIC_PATTERNS.some((re) => re.test(trimmed));
}

export function detectCategory(text: string): MetricCategory {
  const order: MetricCategory[] = ["users", "team", "performance", "scale", "cost"];
  for (const cat of order) {
    if (CATEGORY_KEYWORDS[cat].test(text)) return cat;
  }
  return "generic";
}

export function suggestMetricHint(category: MetricCategory = "generic"): string {
  return CATEGORY_HINTS[category];
}
