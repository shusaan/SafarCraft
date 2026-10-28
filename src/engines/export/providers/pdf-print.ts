/**
 * Client-side PDF export via the browser's own print pipeline.
 *
 * The old server route needed a headless Chromium binary that does not exist
 * on most serverless hosts (Vercel). Instead we render the template into a
 * hidden live DOM node (so the app's real compiled CSS applies), copy that
 * CSS plus the rendered markup into a hidden iframe with paper-sized
 * `@page` rules, and trigger the browser's native "Save as PDF" dialog.
 * Works everywhere, keeps template fidelity, and produces selectable text.
 */
import type { PaperSize, ResumeData, ResumeLayout } from "@/types";
import { renderTemplate } from "@/engines/templates/registry";

const PRINT_PAPERS: Record<PaperSize, { pageRule: string; widthPx: number }> = {
  letter: { pageRule: "8.5in 11in", widthPx: 816 },
  a4: { pageRule: "210mm 297mm", widthPx: 794 },
  legal: { pageRule: "8.5in 14in", widthPx: 816 },
};

/** Collect the page's compiled CSS — inline <style> rules plus <link> sheets. */
async function collectCss(): Promise<string> {
  const chunks: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (rules && rules.length > 0) {
        chunks.push(Array.from(rules).map((r) => r.cssText).join("\n"));
        continue;
      }
    } catch {
      // Cross-origin sheet — fall through to fetching its href.
    }
    if (sheet.href) {
      try {
        const res = await fetch(sheet.href);
        if (res.ok) chunks.push(await res.text());
      } catch {
        /* skip unreachable sheet */
      }
    }
  }

  return chunks.join("\n");
}

export async function printResumeToPDF(
  data: ResumeData,
  layout: ResumeLayout,
  template = "classic-ats",
  paperSize: PaperSize = "letter",
): Promise<void> {
  if (typeof document === "undefined") {
    throw new Error("PDF export requires a browser");
  }

  const { pageRule, widthPx } = PRINT_PAPERS[paperSize] ?? PRINT_PAPERS.letter!;

  // 1. Render the template into a hidden node in the live document so the
  //    app's real Tailwind CSS applies to it.
  const { createRoot } = await import("react-dom/client");
  const { flushSync } = await import("react-dom");

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = `position:fixed;left:-10000px;top:0;width:${widthPx}px;background:#fff;`;
  document.body.appendChild(host);
  const root = createRoot(host);

  let iframe: HTMLIFrameElement | null = null;

  const cleanup = () => {
    try {
      root.unmount();
    } catch {
      /* noop */
    }
    host.remove();
    if (iframe) setTimeout(() => iframe?.remove(), 100);
  };

  try {
    flushSync(() => {
      root.render(renderTemplate(template, { data, layout }));
    });
    const markup = host.innerHTML;

    // 2. Copy the compiled stylesheets.
    const css = await collectCss();

    // 3. Build the print document in a hidden iframe.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${data.personal.name || "Resume"} — Resume</title>
<style>
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;background:#fff;color:#111827;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif}
.resume-print-page{width:${widthPx}px;margin:0 auto;padding:32px;background:#fff}
${css}
</style>
<style>
@page{size:${pageRule};margin:0}
@media print{html,body{width:auto;height:auto;overflow:visible}.resume-print-page{box-shadow:none}}
</style>
</head>
<body>
<div class="resume-print-page">${markup}</div>
</body>
</html>`;

    iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(iframe);

    await new Promise<void>((resolve) => {
      iframe!.onload = () => resolve();
      iframe!.srcdoc = html;
    });

    const win = iframe.contentWindow;
    if (!win) throw new Error("Could not create print frame");

    // Give the frame a tick to lay out and load fonts before printing.
    await new Promise((r) => setTimeout(r, 150));

    win.addEventListener("afterprint", cleanup, { once: true });
    // Safety net: some browsers never fire afterprint.
    setTimeout(cleanup, 30_000);

    win.focus();
    win.print();
  } catch (err) {
    cleanup();
    throw err;
  }
}
