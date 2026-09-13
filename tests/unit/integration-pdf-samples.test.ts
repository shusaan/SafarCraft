import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { extractPDFText } from "@/engines/cv/pdf-extractor";
import { parseCVFallback } from "@/engines/cv/cv-parser";

const samples = [
  "/tmp/opencode/cv-samples/pdfs/cv1-single-column.html.pdf",
  "/tmp/opencode/cv-samples/pdfs/cv2-two-column-sidebar.html.pdf",
  "/tmp/opencode/cv-samples/pdfs/cv3-modern-compact.html.pdf",
];

describe("Real PDF CV samples", () => {
  for (const path of samples) {
    const name = path.split("/").pop()!;

    it(`parses ${name}`, async () => {
      const buf = readFileSync(path);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const extracted = await extractPDFText(ab);
      const result = parseCVFallback(extracted.text);

      // eslint-disable-next-line no-console
      console.log(`\n=== ${name} ===\n` + extracted.text);

      // eslint-disable-next-line no-console
      console.log(`\n--- parsed ${name} ---`);
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(result.parsed, null, 2));

      // Minimum sanity: name and email should be extracted for all CVs
      expect(result.parsed.name.length).toBeGreaterThan(0);
      expect(result.parsed.name).not.toMatch(/\d{1,2}\/\d{1,2}\/\d/); // no date leak
      expect(result.parsed.email).toMatch(/@/);
      expect(result.parsed.experience.length).toBeGreaterThan(0);
      expect(result.parsed.skillGroups.length).toBeGreaterThan(0);
      expect(result.parsed.education.length).toBeGreaterThan(0);
    });
  }
});
