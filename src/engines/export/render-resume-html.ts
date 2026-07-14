import type { ResumeData, ResumeLayout } from "@/types";
import { renderTemplate } from "@/engines/templates/registry";

export async function renderResumeHtml(
  template: string,
  data: ResumeData,
  layout: ResumeLayout,
  width = 816,
  height = 1056,
): Promise<string> {
  const { createElement } = await import("react");
  const { renderToStaticMarkup } = await import("react-dom/server");

  const markup = renderToStaticMarkup(
    createElement(
      "div",
      { className: "resume-document" },
      renderTemplate(template, { data, layout }),
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
*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;width:${width}px;height:${height}px;overflow:hidden}
body{background:#fff}
.resume-page{width:${width}px;height:${height}px;padding:32px;background:#fff;color:#111827;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;overflow:hidden}
.resume-document{width:100%;overflow:hidden}
${css}
</style>
</head>
<body>
<div class="resume-page">${markup}</div>
</body>
</html>`;
}
