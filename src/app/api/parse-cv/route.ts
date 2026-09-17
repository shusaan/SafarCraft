import { NextRequest, NextResponse } from "next/server";
import { extractPDFText } from "@/engines/cv/pdf-extractor";
import { parseCV } from "@/engines/cv/cv-parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    let rawText = "";
    let layout: "single" | "two-column" = "single";
    let numPages = 1;

    // ── Step 1: Extract raw text ──────────────────────────────────────────
    if (ext === "pdf") {
      try {
        const extracted = await extractPDFText(buffer);
        rawText  = extracted.text;
        layout   = extracted.layout;
        numPages = extracted.pages.length;
      } catch (err: any) {
        if (err?.message === "EMPTY_PDF") {
          return NextResponse.json({
            error: "Could not extract text from this PDF. It may be a scanned image. Please paste the text manually using the 'Create from Scratch' tab.",
          }, { status: 422 });
        }
        return NextResponse.json({
          error: "PDF parsing library not available. Run: npm install pdfjs-dist",
        }, { status: 501 });
      }
    } else {
      let mammoth: any;
      try {
        mammoth = await import("mammoth");
      } catch {
        return NextResponse.json({
          error: "DOCX parsing library not available. Run: npm install mammoth",
        }, { status: 501 });
      }
      try {
        const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
        rawText = result.value;
      } catch {
        return NextResponse.json({
          error: "Failed to extract text from DOCX. The file may be corrupted.",
        }, { status: 422 });
      }
    }

    if (!rawText.trim() || rawText.length < 20) {
      return NextResponse.json({
        error: "Could not extract text from this file. Please paste the text manually using the 'Create from Scratch' tab.",
      }, { status: 422 });
    }

    // ── Step 2: Parse into structured data ───────────────────────────────
    const quality = rawText.length > 500 ? "high" : "low";
    const { parsed } = await parseCV(rawText, { layout, numPages, quality });

    return NextResponse.json({ parsed });

  } catch (error) {
    console.error("[parse-cv] error:", error);
    return NextResponse.json({
      error: "Failed to parse file. Please paste the text manually using the 'Create from Scratch' tab.",
    }, { status: 500 });
  }
}
