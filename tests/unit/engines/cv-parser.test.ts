import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseCV, parseCVFallback } from "@/engines/cv/cv-parser";
import type { ParseCVOptions } from "@/engines/cv/cv-parser";

beforeEach(() => {
  vi.restoreAllMocks();
});

const SAMPLE_RESUME = `John Doe
john@example.com
(555) 123-4567
San Francisco, CA
linkedin.com/in/johndoe

SUMMARY
Experienced software engineer with 8 years building scalable web applications.

EXPERIENCE

Senior Software Engineer
Tech Corp, San Francisco
2020-03 – Present
• Led a team of 5 engineers building a React-based dashboard
• Reduced API latency by 40% through query optimisation
• Migrated legacy monolith to microservices on AWS

Software Engineer
Startup Inc, Remote
2017-01 – 2020-02
• Built RESTful APIs with Node.js and Express
• Implemented CI/CD pipeline with GitHub Actions

EDUCATION

Bachelor of Science in Computer Science
University of California, Berkeley
2013 – 2017

SKILLS
Languages: TypeScript, Python, Go
Frameworks: React, Node.js, Express
Tools: Docker, AWS, GitHub Actions`;

describe("parseCV (AI-first, fallback to regex)", () => {
  it("falls back to regex when no API key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    expect(result.parsed.name).toBe("John Doe");
    expect(result.parsed.email).toBe("john@example.com");
    expect(result.parsed.phone).toBe("(555) 123-4567");
  });

  it("passes debug context options without error", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const options: ParseCVOptions = {
      layout: "two-column",
      numPages: 2,
      quality: "high",
    };
    const result = await parseCV(SAMPLE_RESUME, options);
    expect(result.parsed.name).toBe("John Doe");
  });

  it("handles empty text gracefully", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV("");
    expect(result.parsed.name).toBe("");
    expect(result.parsed.experience).toEqual([]);
  });

  it("extracts experience entries", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    expect(result.parsed.experience.length).toBeGreaterThanOrEqual(2);
    expect(result.parsed.experience[0]?.company).toBe("Tech Corp");
    expect(result.parsed.experience[0]?.position).toBe("Senior Software Engineer");
  });

  it("extracts skill groups", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    const allSkills = result.parsed.skillGroups.flatMap((g) => g.skills);
    expect(allSkills).toContain("TypeScript");
    expect(allSkills).toContain("React");
  });

  it("extracts education", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const result = await parseCV(SAMPLE_RESUME);
    expect(result.parsed.education.length).toBeGreaterThanOrEqual(1);
    expect(result.parsed.education[0]?.institution).toContain("California");
  });
});

describe("parseCVFallback (pure regex)", () => {
  it("parses name from first line", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.name).toBe("John Doe");
  });

  it("parses email", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.email).toBe("john@example.com");
  });

  it("parses phone", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.phone).toBe("(555) 123-4567");
  });

  it("parses LinkedIn URL", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.linkedin).toContain("linkedin.com/in/johndoe");
  });

  it("parses location", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.location).toContain("San Francisco");
  });

  it("parses summary", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.parsed.summary.toLowerCase()).toContain("experienced software engineer");
  });

  it("returns empty result for empty input", () => {
    const result = parseCVFallback("");
    expect(result.parsed.name).toBe("");
    expect(result.parsed.experience).toEqual([]);
    expect(result.parsed.education).toEqual([]);
  });
});

// ─── Additional fixtures ────────────────────────────────────────────────────

const EN_DASH_RESUME = `Alex Rivera
alex@example.com
+1 (555) 987-6543
New York, NY

EXPERIENCE
Senior Engineer
Globex Corp - New York, NY
Oct 2022 - June 2025
- Architected event-driven microservices
- Mentored a team of 4 engineers

EDUCATION
MS in Computer Science
Carnegie Mellon University
2018 - 2020

SKILLS
Languages: Rust, Go, Python
Cloud: AWS, GCP, Kubernetes`;

const EM_DASH_RESUME = `Priya Shah
priya@example.com
(555) 222-3333
London, UK

EXPERIENCE

Staff Engineer
Initech Ltd — Remote
2021-03 - Present
- Drove platform reliability from 99.5% to 99.95%

SKILLS
Backend: Java, Kotlin, Spring Boot
Data: PostgreSQL, Kafka, Redis`;

const INTERNATIONAL_PHONE_RESUME = `Carlos Mendoza
carlos@example.com
+44 20 7946 0958
Madrid, Spain

SUMMARY
Engineering leader with 12 years of experience.

EXPERIENCE
Engineering Manager
Telefonica - Madrid
2019 - 2024
- Led 30-engineer org across 3 product lines`;

describe("parseCVFallback — additional fixtures", () => {
  it("parses en-dash date ranges and dash-separated company/location", () => {
    const result = parseCVFallback(EN_DASH_RESUME);
    expect(result.parsed.experience.length).toBe(1);
    const exp = result.parsed.experience[0]!;
    expect(exp.position).toBe("Senior Engineer");
    expect(exp.company).toBe("Globex Corp");
    expect(exp.location).toBe("New York, NY");
    expect(exp.startDate).toBe("2022-10");
    expect(exp.endDate).toBe("2025-06");
    expect(exp.bullets.length).toBe(2);
  });

  it("parses em-dash separators and Present marker", () => {
    const result = parseCVFallback(EM_DASH_RESUME);
    expect(result.parsed.experience.length).toBe(1);
    const exp = result.parsed.experience[0]!;
    expect(exp.position).toBe("Staff Engineer");
    expect(exp.company).toBe("Initech Ltd");
    expect(exp.location).toBe("Remote");
    expect(exp.endDate).toBe("Present");
    expect(exp.current).toBe(true);
  });

  it("captures international phone with country code", () => {
    const result = parseCVFallback(INTERNATIONAL_PHONE_RESUME);
    expect(result.parsed.phone).toContain("7946");
    expect(result.parsed.phone).toContain("+44");
  });

  it("captures parenthesised phone number as-written", () => {
    const result = parseCVFallback(EN_DASH_RESUME);
    expect(result.parsed.phone).toContain("(555)");
  });

  it("parses colon-prefixed skill categories correctly", () => {
    const result = parseCVFallback(EN_DASH_RESUME);
    const cats = result.parsed.skillGroups.map((g) => g.category);
    expect(cats).toContain("Languages");
    expect(cats).toContain("Cloud");
    const langs = result.parsed.skillGroups.find((g) => g.category === "Languages");
    expect(langs?.skills).toContain("Rust");
    expect(langs?.skills).toContain("Python");
  });

  it("handles bare year-only education date range", () => {
    const result = parseCVFallback(EN_DASH_RESUME);
    expect(result.parsed.education.length).toBe(1);
    const edu = result.parsed.education[0]!;
    expect(edu.degree.toLowerCase()).toContain("ms");
    expect(edu.institution).toContain("Carnegie Mellon");
    expect(edu.startDate).toBe("2018-01");
    expect(edu.endDate).toBe("2020-01");
  });

  it("returns empty arrays (not throws) for garbled PDF text", () => {
    const garbled = "xkjfhaskjdf 234234 @#$%^&*() ___ --- 2020 - 2024";
    const result = parseCVFallback(garbled);
    expect(result.parsed.experience).toEqual([]);
    expect(result.parsed.education).toEqual([]);
    expect(result.parsed.skillGroups).toEqual([]);
  });

  it("does not overwrite a valid phone with a date fragment", () => {
    const text = `Jane Doe
jane@example.com
2017 - 2021
+1 (555) 123-4567`;
    const result = parseCVFallback(text);
    expect(result.parsed.phone).toContain("(555)");
    expect(result.parsed.phone).toContain("123-4567");
  });
});

// ─── PDF-extractor regression tests ────────────────────────────────────────

import { extractPDFText } from "@/engines/cv/pdf-extractor";
import { readFileSync } from "node:fs";

const SAMPLE_PDFS = [
  "/tmp/opencode/cv-samples/pdfs/cv1-single-column.html.pdf",
  "/tmp/opencode/cv-samples/pdfs/cv2-two-column-sidebar.html.pdf",
  "/tmp/opencode/cv-samples/pdfs/cv3-modern-compact.html.pdf",
];

describe("PDF extraction — real sample CVs", () => {
  it("strips Chrome date/URL header and footer noise", async () => {
    const buf = readFileSync(SAMPLE_PDFS[0]!);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const result = await extractPDFText(ab);
    expect(result.text).not.toMatch(/^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}/m);
    expect(result.text).not.toMatch(/^fi\s*le:\/\//m);
  });

  it("detects two-column layout for sidebar CV", async () => {
    const buf = readFileSync(SAMPLE_PDFS[1]!);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const result = await extractPDFText(ab);
    expect(result.layout).toBe("two-column");
    expect(result.splitX).not.toBeNull();
  });
});

// ─── End-to-end parse for each sample PDF ───────────────────────────────────

describe("End-to-end parse on real sample CVs", () => {
  for (const path of SAMPLE_PDFS) {
    const name = path.split("/").pop()!;

    it(`extracts meaningful data from ${name}`, async () => {
      const buf = readFileSync(path);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const { text } = await extractPDFText(ab);
      const { parsed } = parseCVFallback(text);

      expect(parsed.name.length).toBeGreaterThan(0);
      // Name must NOT contain the browser date header.
      expect(parsed.name).not.toMatch(/\d{1,2}\/\d{1,2}\/\d/);
      expect(parsed.email).toMatch(/@/);
      expect(parsed.experience.length).toBeGreaterThanOrEqual(2);
      expect(parsed.skillGroups.length).toBeGreaterThan(0);
      expect(parsed.education.length).toBeGreaterThan(0);
    });
  }

  it("extracts the modern-compact CV (letter-spaced headers, single-line header)", async () => {
    const buf = readFileSync(SAMPLE_PDFS[2]!);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const { text } = await extractPDFText(ab);
    const { parsed } = parseCVFallback(text);

    // Letter-spaced headers (`E X P E R I E N C E`) must still be detected.
    expect(parsed.experience.length).toBe(3);

    // Single-line "Engineering Manager — Stripe Jan 2022 - Present" must
    // split correctly into position, company, dates.
    const stripeJob = parsed.experience.find((e) => e.company === "Stripe");
    expect(stripeJob).toBeDefined();
    expect(stripeJob?.position).toBe("Engineering Manager");
    expect(stripeJob?.location).toContain("Seattle");
    expect(stripeJob?.startDate).toBe("2022-01");
    expect(stripeJob?.endDate).toBe("Present");
    expect(stripeJob?.current).toBe(true);
    expect(stripeJob?.bullets.length).toBeGreaterThanOrEqual(2);

    // Compact skill grid (two categories per line) must split into 4 groups.
    expect(parsed.skillGroups.length).toBe(4);
    const cats = parsed.skillGroups.map((g) => g.category);
    expect(cats).toContain("Languages");
    expect(cats).toContain("Backend");
    expect(cats).toContain("Infra");
    expect(cats).toContain("Data");

    // Education: single-line "B.S. Computer Science - Carnegie Mellon University 2011 - 2015"
    expect(parsed.education.length).toBe(1);
    const edu = parsed.education[0]!;
    expect(edu.degree).toBe("B.S. Computer Science");
    expect(edu.institution).toContain("Carnegie Mellon");
  });

  it("extracts the two-column sidebar CV", async () => {
    const buf = readFileSync(SAMPLE_PDFS[1]!);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const { text } = await extractPDFText(ab);
    const { parsed } = parseCVFallback(text);

    // Two-line first name should join to "Maria Garcia".
    expect(parsed.name).toBe("Maria Garcia");

    // All 3 experience entries, each with correct company.
    expect(parsed.experience.length).toBe(3);
    const companies = parsed.experience.map((e) => e.company);
    expect(companies).toContain("Klarna");
    expect(companies).toContain("Cabify");
    expect(companies).toContain("Glovo");

    // 2 education entries with degree and institution separated.
    expect(parsed.education.length).toBe(2);
    expect(parsed.education[0]?.degree.toLowerCase()).toMatch(/msc/);
    expect(parsed.education[0]?.institution).toContain("Politecnica");
    expect(parsed.education[1]?.degree.toLowerCase()).toMatch(/bsc/);
  });

  it("extracts the single-column standard CV", async () => {
    const buf = readFileSync(SAMPLE_PDFS[0]!);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const { text } = await extractPDFText(ab);
    const { parsed } = parseCVFallback(text);

    expect(parsed.name).toBe("John Smith");
    expect(parsed.experience.length).toBe(3);

    // First experience: position line + company/location/dates line pattern.
    const techCorp = parsed.experience[0]!;
    expect(techCorp.company).toBe("Tech Corp");
    expect(techCorp.position).toBe("Senior Software Engineer");
    expect(techCorp.location).toContain("San Francisco");
    expect(techCorp.endDate).toBe("Present");
    expect(techCorp.bullets.length).toBe(3);
  });
});

// ─── New parser edge cases ─────────────────────────────────────────────────

describe("parseCVFallback — modern CV edge cases", () => {
  it("handles letter-spaced section headers", () => {
    const text = `Jane Doe
jane@example.com

E X P E R I E N C E
Software Engineer
Acme
2020 - Present
- Built cool things

S K I L L S
Languages: Python, Go`;
    const result = parseCVFallback(text);
    expect(result.parsed.experience.length).toBe(1);
    expect(result.parsed.skillGroups.length).toBe(1);
    expect(result.parsed.skillGroups[0]?.category).toBe("Languages");
  });

  it("handles single-line position/company/dates", () => {
    const text = `Alex Rivera
alex@example.com

EXPERIENCE
Engineering Manager — Stripe Jan 2022 - Present
- Hired 5 engineers
- Drove adoption

Software Engineer — Airbnb Aug 2018 - Dec 2021
- Reduced latency`;
    const result = parseCVFallback(text);
    expect(result.parsed.experience.length).toBe(2);
    expect(result.parsed.experience[0]?.company).toBe("Stripe");
    expect(result.parsed.experience[0]?.position).toBe("Engineering Manager");
    expect(result.parsed.experience[0]?.startDate).toBe("2022-01");
    expect(result.parsed.experience[0]?.endDate).toBe("Present");
    expect(result.parsed.experience[1]?.company).toBe("Airbnb");
  });

  it("handles single-line company/location/dates following position", () => {
    const text = `Sam Lee
sam@example.com

EXPERIENCE
Senior Engineer
Acme Corp, Remote | March 2020 – Present
- Did things
- Did more things`;
    const result = parseCVFallback(text);
    expect(result.parsed.experience.length).toBe(1);
    const exp = result.parsed.experience[0]!;
    expect(exp.position).toBe("Senior Engineer");
    expect(exp.company).toBe("Acme Corp");
    expect(exp.location).toBe("Remote");
    expect(exp.startDate).toBe("2020-03");
    expect(exp.endDate).toBe("Present");
    expect(exp.bullets.length).toBe(2);
  });

  it("handles skill grid with multiple categories on one line", () => {
    const text = `Test User
t@example.com

SKILLS
Languages: Python, Go, Rust Backend: Django, FastAPI
Infra: Docker, K8s Data: Postgres, Redis`;
    const result = parseCVFallback(text);
    expect(result.parsed.skillGroups.length).toBe(4);
    const cats = result.parsed.skillGroups.map((g) => g.category);
    expect(cats).toContain("Languages");
    expect(cats).toContain("Backend");
    expect(cats).toContain("Infra");
    expect(cats).toContain("Data");
    const langs = result.parsed.skillGroups.find((g) => g.category === "Languages");
    expect(langs?.skills).toContain("Python");
    expect(langs?.skills).toContain("Rust");
  });

  it("handles multi-line first name", () => {
    const text = `Maria
Garcia
maria@example.com
+1 (555) 123-4567
Barcelona, Spain linkedin.com/in/maria github.com/maria

SUMMARY
Engineer with 10 years of experience.`;
    const result = parseCVFallback(text);
    expect(result.parsed.name).toBe("Maria Garcia");
    expect(result.parsed.location).toBe("Barcelona, Spain");
    expect(result.parsed.linkedin).toContain("linkedin");
  });

  it("extracts degree and institution from single-line education", () => {
    const text = `X
x@x.com

EDUCATION
B.S. Computer Science - Carnegie Mellon University 2011 - 2015`;
    const result = parseCVFallback(text);
    expect(result.parsed.education.length).toBe(1);
    const edu = result.parsed.education[0]!;
    expect(edu.degree).toBe("B.S. Computer Science");
    expect(edu.institution).toContain("Carnegie Mellon");
    expect(edu.startDate).toBe("2011-01");
    expect(edu.endDate).toBe("2015-01");
  });

  it("recognises MSc without dots as a degree", () => {
    const text = `X
x@x.com

EDUCATION
MSc Computer Science
MIT
2014 – 2016`;
    const result = parseCVFallback(text);
    expect(result.parsed.education.length).toBe(1);
    expect(result.parsed.education[0]?.degree.toLowerCase()).toContain("msc");
    expect(result.parsed.education[0]?.institution).toBe("MIT");
  });
});
