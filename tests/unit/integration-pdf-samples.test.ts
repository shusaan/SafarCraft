import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { extractPDFText } from "@/engines/cv/pdf-extractor";
import { parseCVFallback } from "@/engines/cv/cv-parser";

// Fixtures that ship with the repo so CI can exercise the parser.
// `tests/fixtures/husn-devops-cv.pdf` is a real-world 2-page CV that
// caught several parser regressions (split sections, mixed Y-buckets,
// glued cert headers, etc.).
const fixtures = [
  path.resolve(__dirname, "..", "fixtures", "husn-devops-cv.pdf"),
];
const haveFixtures = fixtures.every((p) => existsSync(p));

describe.skipIf(!haveFixtures)("Real PDF CV samples (in-repo fixtures)", () => {
  for (const path of fixtures) {
    const name = path.split(/[/\\]/).pop()!;

    it(`parses ${name} end-to-end`, async () => {
      const buf = readFileSync(path);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const extracted = await extractPDFText(ab);
      const result = parseCVFallback(extracted.text);

      // ---- Universal sanity (every CV should satisfy) ----
      expect(result.parsed.name.length).toBeGreaterThan(0);
      expect(result.parsed.name).not.toMatch(/\d{1,2}\/\d{1,2}\/\d/); // no date leak
      expect(result.parsed.email).toMatch(/@/);
      expect(result.parsed.experience.length).toBeGreaterThan(0);
      expect(result.parsed.skillGroups.length).toBeGreaterThan(0);
      expect(result.parsed.education.length).toBeGreaterThan(0);
      // pdf-extractor's Y-sort fix: dates must land in the experience section.
      expect(result.parsed.experience[0]?.startDate).toMatch(/^\d{4}-\d{2}$/);
      expect(result.parsed.experience[0]?.endDate).toMatch(/^\d{4}-\d{2}$/);
    });
  }
});

