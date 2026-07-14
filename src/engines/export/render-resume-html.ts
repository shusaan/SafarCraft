import type { ResumeData, ResumeLayout } from "@/types";
import { renderTemplate } from "@/engines/templates/registry";

export async function renderResumeHtml(
  template: string,
  data: ResumeData,
  layout: ResumeLayout,
): Promise<string> {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");

  const markup = renderToStaticMarkup(
    createElement(
      "div",
      { className: "resume-page" },
      createElement(
        "div",
        { className: "resume-document" },
        renderTemplate(template, { data, layout }),
      ),
    ),
  );

  const { getAppCss } = await import("@/engines/export/css-compiler");
  const css = await getAppCss();

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Resume</title>
<style>
.resume-page{width:816px;margin:0 auto;padding:32px;background:#fff;color:#111827;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif}
.resume-document{width:100%}
${css}
@media print{body{background:#fff}.resume-page{box-shadow:none}}
</style>
</head>
<body style="background:#f5f5f5;margin:0">
<div class="resume-page">${markup}</div>
</body>
</html>`;
}
