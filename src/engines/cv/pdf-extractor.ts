/**
 * PDF text extractor.
 *
 * Strategy:
 * 1. Extract all positioned text items from each page
 * 2. Find column split via X-position bimodal clustering (not strip occupancy)
 * 3. For each detected column, reconstruct lines independently by grouping
 *    items at the same Y coordinate — left column fully before right column
 * 4. Expose raw items so callers can do their own spatial analysis
 */

export interface PDFTextItem {
  str: string;
  x: number;    // left edge in PDF user units
  y: number;    // top-down (flipped from PDF's native bottom-up)
  w: number;    // width
  h: number;    // font size / line height
}

export interface ExtractedPDF {
  text: string;
  layout: "single" | "two-column";
  splitX: number | null;
  /** Raw items per page — useful for debugging or custom extraction */
  pages: PDFTextItem[][];
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function extractPDFText(buffer: ArrayBuffer): Promise<ExtractedPDF> {
  let pdfjs: any;
  try {
    pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  } catch {
    pdfjs = await import("pdfjs-dist");
  }
  try {
    const w = (await import("pdfjs-dist/build/pdf.worker.mjs")).default;
    pdfjs.GlobalWorkerOptions.workerSrc = w;
  } catch { /* optional */ }

  const doc = await (async () => {
    const p = pdfjs.getDocument({ data: new Uint8Array(buffer) });
    return p.promise ? await p.promise : await p;
  })();

  if (!doc || doc.numPages === 0) throw new Error("EMPTY_PDF");

  const allPageItems: PDFTextItem[][] = [];
  const pageTexts: string[] = [];
  let globalLayout: "single" | "two-column" = "single";
  let globalSplitX: number | null = null;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page    = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const vp      = page.getViewport({ scale: 1.0 });

    const items: PDFTextItem[] = [];

    for (const raw of content.items as Array<{
      str?: string; transform?: number[]; width?: number; height?: number;
    }>) {
      const str = (raw.str ?? "").trimEnd();
      if (!str.trim()) continue;

      const x  = raw.transform?.[4] ?? 0;
      const y  = vp.height - (raw.transform?.[5] ?? 0);   // flip to top-down
      const h  = Math.abs(raw.transform?.[3] ?? raw.height ?? 12);
      const w  = (raw.width && raw.width > 0)
        ? raw.width
        : str.length * h * 0.55;   // fallback width estimate

      items.push({ str, x, y, w, h });
    }

    if (items.length === 0) continue;
    allPageItems.push(items);

    const split = findColumnSplit(items);
    if (split !== null) {
      globalLayout = "two-column";
      globalSplitX = split;
    }

    pageTexts.push(renderPage(items, split));
  }

  return {
    text: pageTexts.join("\n\n"),
    layout: globalLayout,
    splitX: globalSplitX,
    pages: allPageItems,
  };
}

// ─── Column split detection ────────────────────────────────────────────────
//
// Approach: X-coordinate bimodal clustering.
//
// For a two-column page, items cluster around TWO x-starts:
//   cluster A = left margin (e.g. 50–55pt)
//   cluster B = right column start (e.g. 320–330pt)
//
// We find the split by:
//   1. Collect all unique x-starts (rounded to 5pt buckets)
//   2. Find the largest gap between any two adjacent occupied buckets
//      in the middle 25–75% of the page width
//   3. Validate: items to the right of the gap must form ≥15% of all items
//      (rules out narrow indented lists that are single-column)

function findColumnSplit(items: PDFTextItem[]): number | null {
  if (items.length < 10) return null;

  // Use only LINE-START items — first item on each Y-line.
  // This avoids wide text spans that bleed across the gutter.
  const lineStarts = getLineStartX(items);
  if (lineStarts.length < 6) return null;

  const xs    = lineStarts.sort((a, b) => a - b);
  const xMin  = xs[0]!;
  const xMax  = xs[xs.length - 1]!;
  const span  = xMax - xMin;
  if (span < 100) return null;

  // Find largest gap between adjacent x-start values in the 25–75% zone
  const lo = xMin + span * 0.25;
  const hi = xMin + span * 0.75;
  const mid = xs.filter((x) => x >= lo && x <= hi);
  if (mid.length < 2) return null;

  let bestGap = 0, bestSplit = -1;
  for (let i = 1; i < mid.length; i++) {
    const gap = mid[i]! - mid[i - 1]!;
    if (gap > bestGap) { bestGap = gap; bestSplit = (mid[i]! + mid[i - 1]!) / 2; }
  }

  // Gap must be meaningful — at least 8% of page span
  if (bestGap < span * 0.08 || bestSplit < 0) return null;

  // Validate: right-side items must be ≥15% of total
  const rightCount = items.filter((it) => it.x >= bestSplit).length;
  if (rightCount / items.length < 0.15) return null;

  return bestSplit;
}

/** Returns the leftmost X per logical line (grouped by Y ±4pt) */
function getLineStartX(items: PDFTextItem[]): number[] {
  const lines = new Map<number, number>();   // yk → min x
  for (const it of items) {
    const yk = Math.round(it.y / 4) * 4;
    const cur = lines.get(yk);
    if (cur === undefined || it.x < cur) lines.set(yk, it.x);
  }
  return Array.from(lines.values());
}

// ─── Text rendering ────────────────────────────────────────────────────────

const LINE_Y_TOLERANCE = 3;  // pt — items within 3pt vertically = same line

function renderPage(items: PDFTextItem[], split: number | null): string {
  if (split === null) return renderColumn(items);

  // Hard split by item midpoint
  const left  = items.filter((it) => it.x + it.w * 0.5 <  split);
  const right = items.filter((it) => it.x + it.w * 0.5 >= split);

  const leftText  = renderColumn(left);
  const rightText = renderColumn(right);

  return leftText + (rightText.trim() ? "\n\n" + rightText : "");
}

function renderColumn(items: PDFTextItem[]): string {
  // Group items into lines by Y proximity
  const lines = new Map<number, PDFTextItem[]>();
  for (const it of items) {
    // Round Y to nearest LINE_Y_TOLERANCE to absorb sub-pixel jitter
    const yk = Math.round(it.y / LINE_Y_TOLERANCE) * LINE_Y_TOLERANCE;
    if (!lines.has(yk)) lines.set(yk, []);
    lines.get(yk)!.push(it);
  }

  return Array.from(lines.entries())
    .sort(([ya], [yb]) => ya - yb)                         // top → bottom
    .map(([, its]) =>
      its
        .sort((a, b) => a.x - b.x)                        // left → right
        .map((it) => it.str)
        .join(" ")
        .trim()
    )
    .filter((l) => l.length > 0)
    .join("\n");
}
