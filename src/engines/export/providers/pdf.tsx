import type { ResumeData, ResumeLayout } from "@/types";

export async function exportPDF(data: ResumeData, _layout: ResumeLayout): Promise<Blob> {
  try {
    const { pdf } = await import("@react-pdf/renderer");
    const { default: PDFDocument } = await import("./pdf-document");

    const instance = pdf(<PDFDocument data={data} />);
    const blob = await instance.toBlob();
    return blob;
  } catch (err) {
    console.error("PDF generation failed:", err);
    throw new Error(`PDF generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
