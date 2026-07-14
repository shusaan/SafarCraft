let cachedCss: string | null = null;

/**
 * Compiles the app's globals.css using PostCSS + @tailwindcss/postcss,
 * then caches the result.
 *
 * Uses dynamic imports to avoid Next.js bundler tracing the lightningcss
 * native binary. The packages are loaded natively via serverExternalPackages.
 */
export async function getAppCss(): Promise<string> {
  if (cachedCss) return cachedCss;

  try {
    const postcss = (await import("postcss")).default;
    const tailwindcss = (await import("@tailwindcss/postcss")).default;

    const { readFileSync, existsSync } = await import("fs");
    const { resolve } = await import("path");

    const candidates = [
      resolve(process.cwd(), "src/app/globals.css"),
      resolve(process.cwd(), "app/globals.css"),
    ];

    let source: string | undefined;
    let sourcePath: string | undefined;
    for (const p of candidates) {
      if (existsSync(p)) {
        sourcePath = p;
        source = readFileSync(p, "utf-8");
        break;
      }
    }

    if (!source || !sourcePath) {
      cachedCss = getFallbackCss();
      return cachedCss;
    }

    const result = await postcss([tailwindcss]).process(source, {
      from: sourcePath,
    });

    cachedCss = result.css;
    return cachedCss;
  } catch (err) {
    console.warn("[css-compiler] Tailwind compilation failed:", err);
    cachedCss = getFallbackCss();
    return cachedCss;
  }
}

function getFallbackCss(): string {
  return [
    "*,*::before,*::after{box-sizing:border-box}",
    "body{margin:0;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#111827}",
    ".resume-page{width:816px;margin:0 auto;padding:32px;background:#fff;color:#111827}",
    ".resume-document{width:100%}",
    ".flex{display:flex}.flex-wrap{flex-wrap:wrap}.flex-1{flex:1}.shrink-0{flex-shrink:0}",
    ".items-start{align-items:flex-start}.items-center{align-items:center}.items-baseline{align-items:baseline}",
    ".justify-between{justify-content:space-between}.justify-center{justify-content:center}",
    ".grid{display:grid}.grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}",
    ".gap-1{gap:4px}.gap-1\\.5{gap:6px}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}.gap-5{gap:20px}.gap-6{gap:24px}",
    ".gap-x-3>*+*{margin-left:12px}.gap-y-0\\.5>*+*{margin-top:2px}",
    ".space-y-0\\.5>*+*{margin-top:2px}.space-y-2>*+*{margin-top:8px}",
    ".w-1\\/3{width:33.333333%}.w-2\\/3{width:66.666667%}.w-full{width:100%}",
    ".h-px{height:1px}.h-1{height:4px}.h-16{height:64px}.h-20{height:80px}.w-16{width:64px}.w-20{width:80px}",
    ".object-cover{object-fit:cover}",
    ".text-center{text-align:center}.text-right{text-align:right}",
    ".text-xs{font-size:11px;line-height:1.4}.text-sm{font-size:13px;line-height:1.4}",
    ".text-xl{font-size:20px;line-height:1.15}.text-2xl{font-size:24px;line-height:1.2}",
    ".font-light{font-weight:300}.font-normal{font-weight:400}.font-medium{font-weight:500}.font-semibold{font-weight:600}.font-bold{font-weight:700}",
    ".uppercase{text-transform:uppercase}.tracking-tight{letter-spacing:-0.01em}.tracking-widest{letter-spacing:0.18em}",
    ".leading-relaxed{line-height:1.6}.leading-tight{line-height:1.25}",
    ".list-disc{list-style:disc}.list-none{list-style:none}",
    ".text-muted-foreground{color:#6b7280}.text-foreground{color:#111827}.text-white{color:#fff}",
    ".bg-muted{background:#f1f5f9}.bg-white{background:#fff}",
    ".bg-gradient-to-r{background-image:linear-gradient(to right,var(--tw-gradient-stops))}",
    ".from-background{--tw-gradient-from:#fff;--tw-gradient-stops:var(--tw-gradient-from),var(--tw-gradient-to,rgba(255,255,255,0))}",
    ".to-muted{--tw-gradient-to:#f1f5f9}.opacity-80{opacity:0.8}",
    ".p-0{padding:0}.p-2{padding:8px}.p-3{padding:12px}.p-4{padding:16px}.p-5{padding:20px}.p-6{padding:24px}.p-8{padding:32px}",
    ".px-2{padding-left:8px;padding-right:8px}.px-3{padding-left:12px;padding-right:12px}",
    ".py-0\\.5{padding-top:2px;padding-bottom:2px}",
    ".pl-3{padding-left:12px}.pl-4{padding-left:16px}",
    ".mt-0\\.5{margin-top:2px}.mt-1{margin-top:4px}.mt-2{margin-top:8px}.mt-3{margin-top:12px}.mt-4{margin-top:16px}",
    ".mb-0{margin-bottom:0}.mb-1{margin-bottom:4px}.mb-1\\.5{margin-bottom:6px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-5{margin-bottom:20px}.mb-6{margin-bottom:24px}",
    ".mx-auto{margin-left:auto;margin-right:auto}",
    ".rounded-sm{border-radius:2px}.rounded{border-radius:4px}.rounded-md{border-radius:6px}.rounded-lg{border-radius:8px}.rounded-full{border-radius:9999px}",
    ".border{border-width:1px;border-style:solid}.border-2{border-width:2px;border-style:solid}",
    ".border-l-2{border-left-width:2px;border-left-style:solid}",
    "@media print{body{background:#fff}.resume-page{box-shadow:none}}",
  ].join("");
}
