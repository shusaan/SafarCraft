import type { ResumeData, ResumeLayout, PaperSize } from "@/types";
import { exportDOCX } from "./providers/docx";
import { exportJSONResume } from "./providers/json-resume";
import { exportMarkdown } from "./providers/markdown";

async function exportPDFFromApi(
  data: ResumeData,
  layout: ResumeLayout,
  template: string,
  paperSize: PaperSize,
): Promise<Blob> {
  const response = await fetch("/api/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, layout, template, paperSize }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "PDF export failed");
  }

  return await response.blob();
}

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
  template = "classic-ats",
  paperSize: PaperSize = "letter",
): Promise<void> {
  let blob: Blob;

  switch (format) {
    case "pdf":
      blob = await exportPDFFromApi(data, layout, template, paperSize);
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
