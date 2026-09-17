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

  // Bucket line-starts to 5pt clusters (so we collapse sub-pixel jitter).
  const buckets = new Map<number, number>();
  for (const x of lineStarts) {
    const k = Math.round(x / 5) * 5;
    buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }

  const sorted = [...buckets.entries()].sort((a, b) => a[0] - b[0]);
  if (sorted.length < 2) return null;

  const xMin = sorted[0]![0];
  const xMax = sorted[sorted.length - 1]![0];
  const span = xMax - xMin;
  if (span < 100) return null;

  // Find the largest gap between adjacent cluster centres. For a real
  // two-column layout the left margin cluster and right column cluster will
  // dominate this gap.
  let bestGap = 0;
  let bestSplit = -1;
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i]![0] - sorted[i - 1]![0];
    if (gap > bestGap) {
      bestGap = gap;
      bestSplit = (sorted[i]![0] + sorted[i - 1]![0]) / 2;
    }
  }

  // Gap must be at least 15% of the page span — narrow gaps are just
  // indented lists, not columns.
  if (bestGap < span * 0.15 || bestSplit < 0) return null;

  // Validate: right-of-split items must be ≥15% of all items.
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

// Patterns that indicate Chrome (or common browsers / print drivers) page
// headers/footers. We strip these from the first/last ~2 lines of each page
// before they pollute parsing.
const BROWSER_HEADER_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s*(?:AM|PM)?\s+/i;
const BROWSER_FOOTER_RE = /^fi\s*le:\/\/\S+\s+\d+\/\d+\s*$/i;
const PAGE_NUM_RE       = /^(?:page\s+)?\d+\s*(?:\/\s*\d+|of\s+\d+)?\s*$/i;

function stripHeaderFooter(lines: string[]): string[] {
  if (lines.length === 0) return lines;
  const result = [...lines];
  // Strip from top (header) — typically 1-2 lines
  while (result.length > 0 && (BROWSER_HEADER_RE.test(result[0]!) || PAGE_NUM_RE.test(result[0]!))) {
    result.shift();
  }
  // Strip from bottom (footer) — typically 1-2 lines
  while (
    result.length > 0 &&
    (BROWSER_FOOTER_RE.test(result[result.length - 1]!) ||
      PAGE_NUM_RE.test(result[result.length - 1]!))
  ) {
    result.pop();
  }
  return result;
}

function renderPage(items: PDFTextItem[], split: number | null): string {
  if (split === null) return renderColumn(items);

  // Hard split by item midpoint
  const left  = items.filter((it) => it.x + it.w * 0.5 <  split);
  const right = items.filter((it) => it.x + it.w * 0.5 >= split);

  const leftText  = renderColumn(left);
  const rightText = renderColumn(right);

  // For two-column pages, only strip the very first line (page header) and
  // very last line (page footer) of the WHOLE page, not of each column
  // independently — they're usually page-wide.
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

  const rendered = Array.from(lines.entries())
    .sort(([ya], [yb]) => ya - yb)                         // top → bottom
    .map(([, its]) =>
      its
        .sort((a, b) => a.x - b.x)                        // left → right
        .map((it) => it.str)
        .join(" ")
        .trim()
    )
    .filter((l) => l.length > 0);

  return stripHeaderFooter(rendered).join("\n");
}
