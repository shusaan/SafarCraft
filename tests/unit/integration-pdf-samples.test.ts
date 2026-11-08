import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { extractPDFText } from "@/engines/cv/pdf-extractor";
import { parseCVFallback } from "@/engines/cv/cv-parser";

// These PDFs are local-only fixtures (`tests/fixtures/*.pdf` is git-ignored).
// CI and fresh clones will not have them, so the whole suite is skipped there.
const FIXTURES_DIR = path.resolve(__dirname, "..", "fixtures");
const SAMPLES = {
  husn: path.join(FIXTURES_DIR, "husn-devops-cv.pdf"),
  template: path.join(FIXTURES_DIR, "cv1.pdf"),
  academic: path.join(FIXTURES_DIR, "cv2.pdf"),
};

async function parseFixture(filePath: string) {
  const buf = readFileSync(filePath);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const extracted = await extractPDFText(ab as ArrayBuffer);
  const result = parseCVFallback(extracted.text);
  return { ...result, extracted };
}

const available = Object.fromEntries(
  Object.entries(SAMPLES).filter(([, p]) => existsSync(p)),
) as Partial<typeof SAMPLES>;

describe.skipIf(Object.keys(available).length === 0)("Real PDF CV samples (local fixtures)", () => {
  it.skipIf(!available.husn)("parses the two-column real-world CV", async () => {
    const { parsed, lowConfidence, extracted } = await parseFixture(SAMPLES.husn!);

    expect(extracted.layout).toBe("two-column");
    expect(extracted.splitX).not.toBeNull();

    expect(parsed.name.length).toBeGreaterThan(0);
    expect(parsed.name).not.toMatch(/\d{1,2}[/-]\d{1,2}[/-]\d/);
    expect(parsed.email).toMatch(/@/);

    // Exactly the roles listed in the document — no phantom company rows.
    expect(parsed.experience).toHaveLength(7);
    expect(parsed.experience.every((e) => e.company.length > 0)).toBe(true);
    expect(parsed.experience[0]?.startDate).toMatch(/^\d{4}-\d{2}$/);
    expect(parsed.experience[0]?.endDate).toMatch(/^\d{4}-\d{2}$/);

    expect(parsed.skillGroups.length).toBeGreaterThanOrEqual(5);
    expect(parsed.skillGroups.flatMap((g) => g.skills)).toContain("Kubernetes");
    expect(parsed.education.length).toBeGreaterThanOrEqual(1);
    expect(lowConfidence).toBe(false);
  });

  it.skipIf(!available.template)("flags an unfilled template as low confidence", async () => {
    const { parsed, lowConfidence } = await parseFixture(SAMPLES.template!);

    expect(parsed.name).toMatch(/forename|surname/i);
    expect(lowConfidence).toBe(true);
  });

  it.skipIf(!available.academic)("parses a multi-page academic CV", async () => {
    const { parsed, lowConfidence } = await parseFixture(SAMPLES.academic!);

    // The name must not have the "PERSONAL PROFILE" header glued onto it.
    expect(parsed.name).toBe("Khawaja Tariq Mahmood");
    expect(parsed.email).toMatch(/@/);
    expect(parsed.phone.replace(/\D/g, "").length).toBeGreaterThanOrEqual(7);

    expect(parsed.education.length).toBeGreaterThanOrEqual(3);
    expect(parsed.education[0]?.degree.length).toBeGreaterThan(0);
    expect(lowConfidence).toBe(false);
  });
});
