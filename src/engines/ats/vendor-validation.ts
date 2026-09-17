// Heuristic parsers emulating how Workday, Greenhouse, and Lever parse resumes.
// These are educated approximations of the documented behaviour of each ATS.
// Real validation requires parsing against the actual vendors, but these rules
// cover the most common failure modes users hit in practice.

import type { ResumeData } from "@/types";

export type ATSVendor = "workday" | "greenhouse" | "lever";

export interface ATSVendorResult {
  vendor: ATSVendor;
  score: number;            // 0..100
  maxScore: number;         // always 100
  parsedCorrectly: boolean[]; // per critical field
  notes: string[];          // human-readable notes
  warnings: string[];       // potential issues this vendor will hit
  recommendations: string[]; // what to do to improve on this vendor
}

interface ParseCheck {
  name: string;
  pass: boolean;
  reason: string;
}

// Workday is the strictest: expects conventional section labels, no tables, no icons.
function workdayValidate(data: ResumeData): ATSVendorResult {
  const checks: ParseCheck[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // 1. Email
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email ?? "");
  checks.push({ name: "Email", pass: emailOk, reason: emailOk ? "Valid format" : "Missing or malformed" });

  // 2. Phone — Workday expects +country format with at least 7 digits
  const phoneDigits = (data.personal.phone ?? "").replace(/\D/g, "");
  const phoneOk = phoneDigits.length >= 7;
  checks.push({ name: "Phone", pass: phoneOk, reason: phoneOk ? `${phoneDigits.length} digits` : "Too few digits" });
  if (!phoneOk) recommendations.push("Use full international format: +1 (555) 123-4567");

  // 3. Name
  const nameOk = (data.personal.name ?? "").trim().length >= 2 && !/[<>{}]/.test(data.personal.name);
  checks.push({ name: "Name", pass: nameOk, reason: nameOk ? "Present" : "Missing or invalid characters" });

  // 4. Experience entries
  const validExp = data.experience.filter((e) => e.company && e.position);
  checks.push({ name: "Experience entries", pass: validExp.length > 0, reason: `${validExp.length} valid role(s)` });

  // 5. Date formats — Workday wants YYYY-MM-DD or YYYY-MM
  const dateFormatOk = data.experience.every((e) => {
    if (!e.startDate) return true;
    return /^\d{4}-\d{2}(-\d{2})?$/.test(e.startDate) || /^\d{4}\/\d{2}$/.test(e.startDate);
  });
  checks.push({ name: "Date formats", pass: dateFormatOk, reason: dateFormatOk ? "ISO YYYY-MM" : "Non-standard" });
  if (!dateFormatOk) recommendations.push("Use YYYY-MM date format everywhere (Workday is strict)");

  // 6. Education
  const eduOk = data.education.some((e) => e.institution && e.degree);
  checks.push({ name: "Education", pass: eduOk, reason: eduOk ? "Has institution + degree" : "Missing" });

  // 7. Bullet character limits — Workday truncates at 2048 chars per bullet
  const longBullets = data.experience.flatMap((e) =>
    e.bullets.filter((b) => b.length > 1500),
  );
  if (longBullets.length > 0) {
    warnings.push(`${longBullets.length} bullet(s) exceed 1500 chars — Workday truncates at 2048`);
    recommendations.push("Keep each bullet under 1500 chars");
  }

  // 8. Number of skills (Workday caps section sizes loosely)
  const totalSkills = data.skills.reduce((n, c) => n + c.skills.length, 0);
  if (totalSkills > 80) {
    warnings.push(`${totalSkills} skills total — Workday sometimes truncates >100`);
    recommendations.push("Keep skills list under 80 to be safe");
  }

  // 9. Special characters in name (icons, emojis)
  if (/[\u{1F300}-\u{1FAFF}]/u.test(data.personal.name ?? "")) {
    warnings.push("Emoji/unicode in name field may break Workday parsing");
  }

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  if (score < 90) recommendations.push("Fill out all sample fields: name + email + phone + at least 1 experience entry");
  if (validExp.some((e) => e.bullets.length === 0)) {
    warnings.push("Experience entry has no bullets — Workday requires at least 1 per role");
  }

  return {
    vendor: "workday",
    score,
    maxScore: 100,
    parsedCorrectly: checks.map((c) => c.pass),
    notes: checks.map((c) => `${c.name}: ${c.pass ? "✓" : "✗"} ${c.reason}`),
    warnings,
    recommendations,
  };
}

// Greenhouse is the most lenient — accepts a wide variety of layouts and labels.
function greenhouseValidate(data: ResumeData): ATSVendorResult {
  const checks: ParseCheck[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  void recommendations; // (kept for future vendor-specific tips)

  checks.push({ name: "Email", pass: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email ?? ""), reason: "Required" });

  // Greenhouse is happy with just a name
  checks.push({ name: "Name", pass: (data.personal.name ?? "").trim().length >= 2, reason: "Required" });

  // Greenhouse uses heuristics on dates — it can parse "May 2021" and "2021-05"
  const expValid = data.experience.filter((e) => e.company && e.position);
  checks.push({ name: "Experience", pass: expValid.length > 0, reason: `${expValid.length} role(s)` });

  const eduValid = data.education.some((e) => e.institution);
  checks.push({ name: "Education", pass: eduValid, reason: eduValid ? "Has institution" : "Missing" });

  // Greenhouse scores bonus for clear skills section
  const hasSkills = data.skills.some((c) => c.skills.length > 0);
  checks.push({ name: "Skills", pass: hasSkills, reason: hasSkills ? "Present" : "Missing" });

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  // Greenhouse warnings are about over-formatting
  if (data.education.length > 6) {
    warnings.push("Greenhouse caps education rows at 6 — list your most recent only");
  }
  if (data.experience.length > 15) {
    warnings.push(`${data.experience.length} jobs is a lot — Greenhouse recommends ≤10`);
  }

  return {
    vendor: "greenhouse",
    score,
    maxScore: 100,
    parsedCorrectly: checks.map((c) => c.pass),
    notes: checks.map((c) => `${c.name}: ${c.pass ? "✓" : "✗"} ${c.reason}`),
    warnings,
    recommendations: score < 100 ? ["Fill any field marked ✗ above"] : [],
  };
}

// Lever is the strictest on content quality, lenient on formatting.
function leverValidate(data: ResumeData): ATSVendorResult {
  const checks: ParseCheck[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  checks.push({ name: "Email", pass: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email ?? ""), reason: "Required" });
  checks.push({ name: "Name", pass: (data.personal.name ?? "").trim().length >= 2, reason: "Required" });
  checks.push({ name: "Phone", pass: (data.personal.phone ?? "").replace(/\D/g, "").length >= 7, reason: "Required" });

  // Lever loves quantified bullets
  const allBullets = data.experience.flatMap((e) => e.bullets.filter(Boolean));
  const withNumber = allBullets.filter((b) => /\d/.test(b)).length;
  const quantifiedPct = allBullets.length === 0 ? 0 : withNumber / allBullets.length;
  checks.push({
    name: "Quantified bullets",
    pass: quantifiedPct >= 0.5,
    reason: `${withNumber}/${allBullets.length} (${Math.round(quantifiedPct * 100)}%)`,
  });
  if (quantifiedPct < 0.5) recommendations.push("Add at least one number to 50% of your bullets");

  // Lever prefers short bullets
  const longBullets = allBullets.filter((b) => b.length > 200).length;
  checks.push({
    name: "Bullet length",
    pass: longBullets === 0,
    reason: `${longBullets} bullet(s) over 200 chars`,
  });
  if (longBullets > 0) recommendations.push("Trim bullets under 200 chars");

  // Lever cares about keyword density
  const allText = [
    data.personal.summary ?? "",
    ...data.experience.flatMap((e) => [e.position, ...e.bullets]),
    ...data.skills.flatMap((c) => c.skills),
  ].join(" ").toLowerCase();
  const uniqueSkills = new Set(
    data.skills.flatMap((c) => c.skills.map((s) => s.toLowerCase().trim())),
  );
  const skillHits = Array.from(uniqueSkills).filter((s) => s && allText.includes(s));
  const density = allText.length === 0 ? 0 : skillHits.length / (allText.split(/\s+/).length / 100);
  checks.push({
    name: "Skill keyword density",
    pass: density >= 5,
    reason: `${density.toFixed(1)} skills/100 words`,
  });
  if (density < 5) recommendations.push("Mention your skills more frequently in bullets");

  // Summary
  checks.push({
    name: "Summary",
    pass: (data.personal.summary ?? "").length > 50,
    reason: (data.personal.summary ?? "").length > 50 ? "Present" : "Missing",
  });
  if ((data.personal.summary ?? "").length <= 50) {
    recommendations.push("Add a 2-3 sentence professional summary");
  }

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    vendor: "lever",
    score,
    maxScore: 100,
    parsedCorrectly: checks.map((c) => c.pass),
    notes: checks.map((c) => `${c.name}: ${c.pass ? "✓" : "✗"} ${c.reason}`),
    warnings,
    recommendations,
  };
}

export function validateAgainstVendors(data: ResumeData): ATSVendorResult[] {
  return [workdayValidate(data), greenhouseValidate(data), leverValidate(data)];
}

export const VENDOR_LABELS: Record<ATSVendor, string> = {
  workday: "Workday",
  greenhouse: "Greenhouse",
  lever: "Lever",
};

export const VENDOR_DESCRIPTIONS: Record<ATSVendor, string> = {
  workday: "Strict parser, used by 60% of Fortune 500",
  greenhouse: "Forgiving parser, used by most tech startups",
  lever: "Content-quality focused, used by Netflix, Spotify",
};