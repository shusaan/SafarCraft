import type { ResumeData, ResumeLayout } from "@/types";
import { checkHtmlText, type ParseBenchmarkResult } from "./parse-benchmark";
import { renderResumeHtml } from "./render-resume-html";

/** Test-only helper: renders the real HTML export and verifies its recoverable text. */
export async function checkHtmlParse(
  data: ResumeData,
  template: string,
  layout: ResumeLayout,
): Promise<ParseBenchmarkResult> {
  try {
    const html = await renderResumeHtml(template, data, layout);
    return checkHtmlText(html, data);
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
