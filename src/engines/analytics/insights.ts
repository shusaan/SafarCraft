/**
 * Insights — computes resume metrics for the Insights Dashboard.
 */

import type { ResumeData } from "@/types";

export interface Insights {
  totalBullets: number;
  avgBulletLength: number;
  longestBullet: number;
  shortestBullet: number;
  bulletsWithNumbers: number;
  bulletsWithWeakVerbs: number;
  verbsByFirstWord: Record<string, number>;
  sectionCounts: Record<string, number>;
  bulletLengthBuckets: { bucket: string; count: number }[];
}

const WEAK_FIRST = new Set([
  "worked", "was", "were", "had", "has", "have", "did", "made", "got", "helped",
  "responsible", "handled", "performed", "provided", "assisted", "supported",
]);

export function computeInsights(data: ResumeData): Insights {
  const allBullets = data.experience.flatMap((e) => e.bullets.filter(Boolean));

  const lengths = allBullets.map((b) => b.length);
  const avg = lengths.length > 0 ? Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length) : 0;
  const max = lengths.length > 0 ? Math.max(...lengths) : 0;
  const min = lengths.length > 0 ? Math.min(...lengths) : 0;

  const withNumbers = allBullets.filter((b) => /\d/.test(b)).length;
  const weak = allBullets.filter((b) => {
    const first = b.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
    return WEAK_FIRST.has(first);
  }).length;

  const verbsByFirstWord: Record<string, number> = {};
  for (const b of allBullets) {
    const first = b.trim().split(/\s+/)[0];
    if (first) {
      const cleaned = first.toLowerCase().replace(/[^\w]/g, "");
      if (cleaned) verbsByFirstWord[cleaned] = (verbsByFirstWord[cleaned] ?? 0) + 1;
    }
  }

  const sectionCounts: Record<string, number> = {
    experience: data.experience.filter((e) => e.company || e.position).length,
    education: data.education.filter((e) => e.institution).length,
    skills: data.skills.reduce((sum, c) => sum + c.skills.length, 0),
    projects: data.projects.filter((p) => p.name).length,
    certifications: data.certifications.filter((c) => c.name).length,
    languages: data.languages.filter((l) => l.language).length,
  };

  const buckets = [
    { bucket: "< 50", count: 0 },
    { bucket: "50-100", count: 0 },
    { bucket: "100-150", count: 0 },
    { bucket: "150-200", count: 0 },
    { bucket: "200+", count: 0 },
  ];
  for (const l of lengths) {
    if (l < 50) buckets[0]!.count++;
    else if (l < 100) buckets[1]!.count++;
    else if (l < 150) buckets[2]!.count++;
    else if (l < 200) buckets[3]!.count++;
    else buckets[4]!.count++;
  }

  return {
    totalBullets: allBullets.length,
    avgBulletLength: avg,
    longestBullet: max,
    shortestBullet: min,
    bulletsWithNumbers: withNumbers,
    bulletsWithWeakVerbs: weak,
    verbsByFirstWord,
    sectionCounts,
    bulletLengthBuckets: buckets,
  };
}
