import type { ResumeData, ResumeLayout } from "@/types";
import { exportPDF } from "./providers/pdf";
import { exportDOCX } from "./providers/docx";
import { exportJSONResume } from "./providers/json-resume";
import { exportMarkdown } from "./providers/markdown";

export type ExportFormat = "pdf" | "docx" | "json" | "markdown";

const extensions: Record<ExportFormat, string> = {
  pdf: "pdf",
  docx: "docx",
  json: "json",
  markdown: "md",
};

const mimeTypes: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  json: "application/json",
  markdown: "text/markdown",
};

export async function exportResume(
  data: ResumeData,
  layout: ResumeLayout,
  format: ExportFormat,
): Promise<void> {
  let blob: Blob;

  switch (format) {
    case "pdf":
      blob = await exportPDF(data, layout);
      break;
    case "docx":
      blob = await exportDOCX(data);
      break;
    case "json":
      blob = exportJSONResume(data);
      break;
    case "markdown":
      blob = exportMarkdown(data);
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
