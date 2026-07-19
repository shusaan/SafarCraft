import { NextRequest, NextResponse } from "next/server";

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

    let text = "";

    if (ext === "pdf") {
      try {
        const pdfjs = await import("pdfjs-dist");
        const buf = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buf }).promise;
        const pages: string[] = [];
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: { str?: string }) => item.str ?? "").join(" ");
          pages.push(pageText);
        }
        text = pages.join("\n\n");
      } catch {
        return NextResponse.json({
          error: "PDF parsing library not available. Run: npm install pdfjs-dist",
        }, { status: 501 });
      }
    } else {
      try {
        const mammoth = await import("mammoth");
        const buf = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buf });
        text = result.value;
      } catch {
        return NextResponse.json({
          error: "DOCX parsing library not available. Run: npm install mammoth",
        }, { status: 501 });
      }
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "No text could be extracted from the file" }, { status: 422 });
    }

    return NextResponse.json({ text: text.slice(0, 10000) });
  } catch {
    return NextResponse.json({ error: "Failed to parse file" }, { status: 500 });
  }
}
