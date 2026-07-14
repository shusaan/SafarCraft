import { NextResponse } from "next/server";
import type { ResumeData, ResumeLayout } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      data?: ResumeData;
      layout?: ResumeLayout;
      template?: string;
    };

    const data = body.data;
    const layout = body.layout;
    const template = body.template ?? "classic-ats";

    if (!data || !layout) {
      return NextResponse.json({ error: "Missing resume data or layout" }, { status: 400 });
    }

    const { chromium } = await import("playwright");
    const browser = await chromium.launch({
      headless: true,
      executablePath: process.env.CHROMIUM_PATH ?? undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage({
      viewport: { width: 816, height: 1056 },
    });

    const { renderResumeHtml } = await import("@/engines/export/render-resume-html");
    const html = await renderResumeHtml(template, data, layout);
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      width: "8.5in",
      height: "11in",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export route failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
