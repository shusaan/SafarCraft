import type { ResumeData, ResumeLayout, PaperSize } from "@/types";
import { exportDOCX } from "./providers/docx";
import { exportMarkdown } from "./providers/markdown";
import { exportJSONResume } from "./providers/json-resume";
import { printResumeToPDF } from "./providers/pdf-print";

export type ExportFormat = "pdf" | "docx" | "markdown" | "json";

const extensions: Record<ExportFormat, string> = {
  pdf: "pdf",
  docx: "docx",
  markdown: "md",
  json: "json",
};

const mimeTypes: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  markdown: "text/markdown",
  json: "application/json",
};

export async function exportResume(
  data: ResumeData,
  layout: ResumeLayout,
  format: ExportFormat,
  template = "classic-ats",
  paperSize: PaperSize = "letter",
): Promise<void> {
  let blob: Blob;

  switch (format) {
    case "pdf":
      // Client-side print flow — opens the browser's "Save as PDF" dialog.
      // No blob download; works on serverless hosts without Chromium.
      await printResumeToPDF(data, layout, template, paperSize);
      return;
    case "docx":
      blob = await exportDOCX(data);
      break;
    case "markdown":
      blob = exportMarkdown(data);
      break;
    case "json":
      blob = exportJSONResume(data);
      break;
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.personal.name || "resume"}.${extensions[format]}`;
  a.click();
  URL.revokeObjectURL(url);
}

export { mimeTypes, extensions };
