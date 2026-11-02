/**
 * Export parseability checks.
 *
 * These are real checks against the files SafarCraft produces — not vendor
 * simulations. DOCX is parsed with mammoth, HTML with the DOM, and PDF text can
 * be checked with the same verifier in tests (runtime PDF uses the print flow).
 */

import type { ResumeData } from "@/types";
import { exportDOCX } from "./providers/docx";

export type ParseFieldCheck = {
  field: string;
  found: boolean;
  expected: string;
};

export type ParseBenchmarkResult = {
  format: "pdf" | "docx" | "html";
  passed: boolean;
  textLength: number;
  checks: ParseFieldCheck[];
  error?: string;
};

function normalize(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function includes(text: string, value: string): boolean {
  const needle = normalize(value);
  return needle.length > 0 && normalize(text).includes(needle);
}

/** Verifies the fields an ATS or recruiter must be able to recover. */
export function verifyResumeText(text: string, data: ResumeData): ParseFieldCheck[] {
  const checks: ParseFieldCheck[] = [];
  const add = (field: string, expected: string) => {
    if (!expected.trim()) return;
    checks.push({ field, expected, found: includes(text, expected) });
  };

  add("Name", data.personal.name);
  add("Email", data.personal.email);
  add("Phone", data.personal.phone);

  const latestRole = data.experience[0];
  if (latestRole) {
    add("Company", latestRole.company);
    add("Job title", latestRole.position);
    add("Achievement bullet", latestRole.bullets.find((bullet) => bullet.trim()) ?? "");
    add(
      "Date range",
      latestRole.current ? latestRole.startDate : latestRole.endDate || latestRole.startDate,
    );
  }

  const firstEducation = data.education[0];
  if (firstEducation) {
    add("Institution", firstEducation.institution);
    add("Degree", firstEducation.degree);
  }

  const firstSkill = data.skills.flatMap((category) => category.skills).find((skill) => skill.trim());
  if (firstSkill) add("Skill", firstSkill);

  const sectionChecks: Array<[string, RegExp]> = [
    ["Experience section", /experience|employment|work history/i],
    ["Skills section", /skills|competencies|technologies/i],
  ];
  if (data.education.length > 0) sectionChecks.push(["Education section", /education|academic/i]);
  if (data.projects.length > 0) sectionChecks.push(["Projects section", /projects|portfolio/i]);

  for (const [field, pattern] of sectionChecks) {
    checks.push({ field, expected: pattern.source, found: pattern.test(text) });
  }

  return checks;
}

function pass(checks: ParseFieldCheck[]): boolean {
  return checks.length > 0 && checks.every((check) => check.found);
}

export async function checkDocxParse(data: ResumeData): Promise<ParseBenchmarkResult> {
  try {
    let mammoth: { extractRawText: (input: { buffer: Buffer } | { arrayBuffer: ArrayBuffer }) => Promise<{ value?: string }> };
    try {
      mammoth = await import("mammoth");
    } catch {
      return {
        format: "docx",
        passed: false,
        textLength: 0,
        checks: [],
        error: "DOCX parser is not available in this environment.",
      };
    }

    const blob = await exportDOCX(data);
    const arrayBuffer = await blob.arrayBuffer();
    const result = await mammoth.extractRawText(
      typeof Buffer !== "undefined"
        ? { buffer: Buffer.from(arrayBuffer) }
        : { arrayBuffer },
    );
    const text = String(result.value ?? "");
    const checks = verifyResumeText(text, data);

    return {
      format: "docx",
      passed: pass(checks),
      textLength: text.length,
      checks,
    };
  } catch (error) {
    return {
      format: "docx",
      passed: false,
      textLength: 0,
      checks: [],
      error: error instanceof Error ? error.message : "DOCX parse check failed.",
    };
  }
}

/** Verifies already-rendered HTML without pulling the server-only CSS compiler into client bundles. */
export function checkHtmlText(html: string, data: ResumeData): ParseBenchmarkResult {
  try {
    if (typeof DOMParser === "undefined") throw new Error("DOMParser is not available.");
    const document = new DOMParser().parseFromString(html, "text/html");
    const text = document.body.textContent ?? "";
    const checks = verifyResumeText(text, data);

    return {
      format: "html",
      passed: pass(checks),
      textLength: text.length,
      checks,
    };
  } catch (error) {
    return {
      format: "html",
      passed: false,
      textLength: 0,
      checks: [],
      error: error instanceof Error ? error.message : "HTML parse check failed.",
    };
  }
}

/** Used by tests that have already extracted text from a generated PDF. */
export function checkPdfText(text: string, data: ResumeData): ParseBenchmarkResult {
  const checks = verifyResumeText(text, data);
  return {
    format: "pdf",
    passed: pass(checks),
    textLength: text.length,
    checks,
  };
}

export async function runExportParseBenchmark(data: ResumeData): Promise<ParseBenchmarkResult[]> {
  return [await checkDocxParse(data)];
}
