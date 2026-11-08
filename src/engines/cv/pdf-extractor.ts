/**
 * PDF text extractor.
 *
 * Strategy:
 * 1. Extract all positioned text items from each page.
 * 2. Detect a genuine second column / sidebar from the X-distribution of
 *    item left edges. A real column is a tight, tall cluster that starts
 *    right of the page's horizontal midpoint; indented bullets from a
 *    single-column CV do not form such a cluster.
 * 3. Partition items into columns by their left edge, then group each column
 *    into visual lines by Y. (Grouping by Y before partitioning would merge
 *    unrelated left/right content that happens to share a row.)
 * 4. Re-attach a wrapped full-width paragraph's tail that landed in the
 *    right column (a lowercase/punctuation-led fragment right at the gutter
 *    whose left neighbour reaches the gutter).
 * 5. For sidebar layouts, emit every page's main column first, then every
 *    page's sidebar — otherwise the sidebar interrupts the main narrative
 *    between pages and section detection breaks.
 * 6. Expose raw items so callers can do their own spatial analysis.
 *
 * All heuristics are layout-agnostic; nothing here is specific to a single
 * document. When the split is ambiguous we fall back to single-column, which
 * is exactly the previous behaviour (never worse than before).
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

// ─── Tunables ──────────────────────────────────────────────────────────────

const LINE_Y_TOLERANCE = 3;           // pt — items within 3pt vertically = same line
const CANDIDATE_START_FRACTION = 0.5; // a 2nd column must start past half the page
const SIDEBAR_START_FRACTION = 0.6;   // past this fraction, call the 2nd column a sidebar
const BIN_PT = 8;                     // X histogram bucket size
const MAX_RUN_GAP_BINS = 2;           // occupied bins this close belong to one run
const MAX_COLUMN_EXTENT_PT = 60;      // a column's left edges are tightly gridded
const MIN_COLUMN_FRACTION = 0.08;     // the 2nd column must hold ≥8% of items
const MIN_COLUMN_SPAN = 0.35;         // a real column spans ≥35% of the page height
const MIN_GUTTER_PT = 12;             // whitespace gutter between columns
const MIN_ITEMS_FOR_SPLIT = 12;

// ─── Browser / print-driver header / footer noise ──────────────────────────

const BROWSER_HEADER_RE = /^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}\s*(?:AM|PM)?\s+/i;
const BROWSER_FOOTER_RE = /^fi\s*le:\/\/\S+\s+\d+\/\d+\s*$/i;
const PAGE_NUM_RE       = /^(?:page\s+)?\d+\s*(?:\/\s*\d+|of\s+\d+)?\s*$/i;

function stripHeaderFooter(lines: string[]): string[] {
  if (lines.length === 0) return lines;
  const result = [...lines];
  while (result.length > 0 && (BROWSER_HEADER_RE.test(result[0]!) || PAGE_NUM_RE.test(result[0]!))) {
    result.shift();
  }
  while (
    result.length > 0 &&
    (BROWSER_FOOTER_RE.test(result[result.length - 1]!) ||
      PAGE_NUM_RE.test(result[result.length - 1]!))
  ) {
    result.pop();
  }
  return result;
}

// ─── Line grouping ─────────────────────────────────────────────────────────

interface Line {
  y: number;
  items: PDFTextItem[];
  startX: number;
}

function groupIntoLines(items: PDFTextItem[]): Line[] {
  const buckets = new Map<number, PDFTextItem[]>();
  for (const it of items) {
    const key = Math.round(it.y / LINE_Y_TOLERANCE) * LINE_Y_TOLERANCE;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(it);
    else buckets.set(key, [it]);
  }
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)                 // top → bottom
    .map(([y, its]) => {
      its.sort((a, b) => a.x - b.x);           // left → right
      return { y, items: its, startX: its[0]!.x };
    });
}

function lineMaxRight(line: Line): number {
  return Math.max(...line.items.map((it) => it.x + it.w));
}

function renderLines(lines: Line[]): string {
  const rendered = lines
    .map((line) => line.items.map((it) => it.str).join(" ").trim())
    .filter((l) => l.length > 0);
  return stripHeaderFooter(rendered).join("\n");
}

function renderItems(items: PDFTextItem[]): string {
  return renderLines(groupIntoLines(items));
}

// ─── Column / sidebar detection ────────────────────────────────────────────

interface PageSplit {
  splitX: number;
  kind: "sidebar" | "two-column";
}

/**
 * Detect a second visual column from the X histogram of item left edges.
 *
 * Items span a range of X even in a single column (the words inside a line
 * start at many X positions), so we do not look at individual items. Instead
 * we look for a *tight run* of occupied X bins — an actual column has all its
 * lines starting within a small band. Guards (all must hold):
 *  - the run starts past 50% of the page width;
 *  - it holds ≥8% of items;
 *  - its left edges span ≤60pt (tightly gridded);
 *  - it spans ≥35% of the page height (tall);
 *  - there is a ≥12pt gutter of whitespace before it.
 */
function detectSplit(items: PDFTextItem[], pageW: number, pageSpan: number): PageSplit | null {
  if (items.length < MIN_ITEMS_FOR_SPLIT || pageW <= 0 || pageSpan <= 0) return null;

  // Full-width items (headers, banners) are not column members.
  const usable = items.filter((i) => i.w > 0 && i.w < pageW * 0.6);
  if (usable.length < MIN_ITEMS_FOR_SPLIT) return null;

  const hist = new Map<number, PDFTextItem[]>();
  for (const it of usable) {
    const bin = Math.floor(it.x / BIN_PT);
    const bucket = hist.get(bin);
    if (bucket) bucket.push(it);
    else hist.set(bin, [it]);
  }

  const occupied = Array.from(hist.keys()).sort((a, b) => a - b);
  const runs: number[][] = [];
  let currentRun: number[] = [];
  for (const bin of occupied) {
    if (currentRun.length === 0 || bin - currentRun[currentRun.length - 1]! <= MAX_RUN_GAP_BINS) {
      currentRun.push(bin);
    } else {
      runs.push(currentRun);
      currentRun = [bin];
    }
  }
  if (currentRun.length) runs.push(currentRun);

  let best: { items: PDFTextItem[]; minX: number } | null = null;

  for (const run of runs) {
    const runItems = run.flatMap((bin) => hist.get(bin)!);
    if (runItems.length < Math.max(3, Math.ceil(usable.length * MIN_COLUMN_FRACTION))) continue;

    const minX = Math.min(...runItems.map((i) => i.x));
    const maxX = Math.max(...runItems.map((i) => i.x));
    if (minX < pageW * CANDIDATE_START_FRACTION) continue;
    if (maxX - minX > MAX_COLUMN_EXTENT_PT) continue;

    const ys = runItems.map((i) => i.y);
    if ((Math.max(...ys) - Math.min(...ys)) / pageSpan < MIN_COLUMN_SPAN) continue;

    // Gutter: right edge of the nearest left-column content must clear minX.
    const leftItems = items.filter(
      (i) => i.x + i.w <= minX && i.w < pageW * 0.6,
    );
    if (leftItems.length === 0) continue;
    const leftMaxRight = Math.max(...leftItems.map((i) => i.x + i.w));
    if (minX - leftMaxRight < MIN_GUTTER_PT) continue;

    if (!best || runItems.length > best.items.length) {
      best = { items: runItems, minX };
    }
  }

  if (!best) return null;

  const kind: PageSplit["kind"] =
    best.minX >= pageW * SIDEBAR_START_FRACTION ? "sidebar" : "two-column";

  return { splitX: best.minX, kind };
}

// ─── Column splitting / de-tearing ─────────────────────────────────────────

const CONTINUATION_START_RE = /^[a-z0-9(,;:)\-–—]/;
const TERMINAL_PUNCT_RE = /[.!?:;]$/;

/**
 * Partition items into left/right halves and rebuild each column's lines.
 * Then pull wrapped full-width paragraph tails (lowercase/punctuation-led
 * fragments sitting right at the gutter) back into the left column.
 */
function splitColumns(items: PDFTextItem[], splitX: number): { left: string; right: string } {
  const leftItems: PDFTextItem[] = [];
  const rightItems: PDFTextItem[] = [];

  for (const it of items) {
    const spansGutter = it.x < splitX && it.x + it.w > splitX;
    if (it.x >= splitX && !spansGutter) rightItems.push(it);
    else leftItems.push(it);
  }

  const leftLines = groupIntoLines(leftItems);
  let rightLines = groupIntoLines(rightItems);

  const mergedRightYs = new Set<number>();
  for (const rl of rightLines) {
    const first = rl.items[0];
    if (!first) continue;
    if (!CONTINUATION_START_RE.test(first.str.trim())) continue;
    if (first.x > splitX + 80) continue;

    const target = leftLines.find(
      (ll) =>
        Math.abs(ll.y - rl.y) <= LINE_Y_TOLERANCE * 1.5 &&
        lineMaxRight(ll) >= splitX - 40,
    );
    if (!target) continue;

    const last = target.items[target.items.length - 1];
    if (last && TERMINAL_PUNCT_RE.test(last.str.trim())) continue;

    target.items.push(...rl.items);
    target.items.sort((a, b) => a.x - b.x);
    target.startX = target.items[0]!.x;
    mergedRightYs.add(rl.y);
  }

  rightLines = rightLines.filter((l) => !mergedRightYs.has(l.y));

  return { left: renderLines(leftLines), right: renderLines(rightLines) };
}

// ─── pdfjs loading (with standard-font data for non-embedded fonts) ────────

async function loadPdfjs(): Promise<any> {
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
  return pdfjs;
}

/**
 * Resolve pdfjs-dist's bundled standard_fonts directory. Without this, PDFs
 * that rely on non-embedded standard fonts emit "standardFontDataUrl" errors
 * and can extract garbled glyphs. Best-effort: if resolution fails we simply
 * omit the option (pdfjs keeps working for embedded-font PDFs).
 */
async function resolveStandardFontsDir(): Promise<string | undefined> {
  try {
    const { createRequire } = await import("node:module");
    const { dirname, join } = await import("node:path");
    const req = createRequire(join(process.cwd(), "index.js"));
    const pkgPath = req.resolve("pdfjs-dist/package.json");
    return join(dirname(pkgPath), "standard_fonts") + "/";
  } catch {
    return undefined;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function extractPDFText(buffer: ArrayBuffer): Promise<ExtractedPDF> {
  const pdfjs = await loadPdfjs();
  const standardFontDataUrl = await resolveStandardFontsDir();

  const doc = await (async () => {
    const options: Record<string, unknown> = { data: new Uint8Array(buffer) };
    if (standardFontDataUrl) options.standardFontDataUrl = standardFontDataUrl;
    const p = pdfjs.getDocument(options);
    return p.promise ? await p.promise : await p;
  })();

  if (!doc || doc.numPages === 0) throw new Error("EMPTY_PDF");

  const allPageItems: PDFTextItem[][] = [];
  type PageRecord =
    | { kind: "plain"; text: string }
    | { kind: "split"; main: string; side: string };
  const records: PageRecord[] = [];

  let firstSplitX: number | null = null;
  let sawSplit = false;
  let sawSidebar = false;

  for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
    const page = await doc.getPage(pageNum);
    const content = await page.getTextContent();
    const vp = page.getViewport({ scale: 1.0 });

    const items: PDFTextItem[] = [];
    for (const raw of content.items as Array<{
      str?: string; transform?: number[]; width?: number; height?: number;
    }>) {
      const str = (raw.str ?? "").trimEnd();
      if (!str.trim()) continue;

      const x = raw.transform?.[4] ?? 0;
      const y = vp.height - (raw.transform?.[5] ?? 0); // flip to top-down
      const h = Math.abs(raw.transform?.[3] ?? raw.height ?? 12);
      const w = (raw.width && raw.width > 0)
        ? raw.width
        : str.length * h * 0.55; // fallback width estimate

      items.push({ str, x, y, w, h });
    }

    if (items.length === 0) continue;
    allPageItems.push(items);

    const pageW = Math.max(...items.map((i) => i.x + i.w));
    const ys = items.map((i) => i.y);
    const pageSpan = Math.max(...ys) - Math.min(...ys);
    const split = detectSplit(items, pageW, pageSpan);

    if (!split) {
      records.push({ kind: "plain", text: renderItems(items) });
      continue;
    }

    sawSplit = true;
    if (firstSplitX === null) firstSplitX = split.splitX;
    if (split.kind === "sidebar") sawSidebar = true;

    const { left, right } = splitColumns(items, split.splitX);
    records.push({ kind: "split", main: left, side: right });
  }

  let text: string;
  if (sawSidebar) {
    // Sidebar layouts: the main narrative flows across pages, so concatenate
    // every main column first, then append the sidebars. Otherwise the sidebar
    // (skills/certs) interrupts sections halfway through the document.
    const mainParts: string[] = [];
    const sideParts: string[] = [];
    for (const rec of records) {
      if (rec.kind === "plain") {
        if (rec.text) mainParts.push(rec.text);
      } else {
        if (rec.main) mainParts.push(rec.main);
        if (rec.side) sideParts.push(rec.side);
      }
    }
    text = [...mainParts, ...sideParts].filter(Boolean).join("\n\n");
  } else {
    // Single column, or classic 50/50 two-column where the right column is a
    // direct continuation of the left on the same page.
    text = records
      .map((rec) => (rec.kind === "plain" ? rec.text : [rec.main, rec.side].filter(Boolean).join("\n\n")))
      .filter(Boolean)
      .join("\n\n");
  }

  return {
    text,
    layout: sawSplit ? "two-column" : "single",
    splitX: firstSplitX,
    pages: allPageItems,
  };
}
