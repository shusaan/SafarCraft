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
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// `tests/fixtures/*.pdf` are local-only (git-ignored). When absent (CI, fresh
// clone) these tests are skipped — they guard the local PDF pipeline.
const FIXTURES = path.resolve(__dirname, "..", "..", "fixtures");
const SAMPLE_PDFS = {
  twoColumn: path.join(FIXTURES, "husn-devops-cv.pdf"),
  template: path.join(FIXTURES, "cv1.pdf"),
  academic: path.join(FIXTURES, "cv2.pdf"),
};
const haveSamplePdfs = Object.values(SAMPLE_PDFS).every((p) => existsSync(p));

describe.skipIf(!haveSamplePdfs)("PDF extraction — local fixture CVs", () => {
  it("detects a two-column layout and a split boundary", async () => {
    const buf = readFileSync(SAMPLE_PDFS.twoColumn);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const result = await extractPDFText(ab);
    expect(result.layout).toBe("two-column");
    expect(result.splitX).not.toBeNull();
  });

  it("does not invent a two-column split for single-column documents", async () => {
    for (const file of [SAMPLE_PDFS.template, SAMPLE_PDFS.academic]) {
      const buf = readFileSync(file);
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
      const result = await extractPDFText(ab);
      expect(result.layout).toBe("single");
      expect(result.splitX).toBeNull();
    }
  });

  it("produces text without chrome date/URL headers", async () => {
    const buf = readFileSync(SAMPLE_PDFS.twoColumn);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    const result = await extractPDFText(ab);
    expect(result.text).not.toMatch(/^\d{1,2}\/\d{1,2}\/\d{2,4},?\s+\d{1,2}:\d{2}/m);
    expect(result.text).not.toMatch(/^fi\s*le:\/\//m);
  });
});

// ─── New parser edge cases ─────────────────────────────────────────────────

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

// ─── Regression tests for parser hardening ─────────────────────────────────

describe("parseCVFallback — date and layout hardening", () => {
  it("normalises academic term dates", () => {
    const text = `Jane Doe
jane@example.com
(555) 123-4567

EXPERIENCE
Lecturer
State University
Fall 2014 - Spring 2016
- Taught algebra`;
    const result = parseCVFallback(text);
    expect(result.parsed.experience[0]?.startDate).toBe("2014-09");
    expect(result.parsed.experience[0]?.endDate).toBe("2016-03");
  });

  it("treats 'To date' and 'Ongoing' as present", () => {
    for (const marker of ["To date", "Till date", "Ongoing", "Now"]) {
      const text = `Jane Doe
jane@example.com
(555) 123-4567

EXPERIENCE
Engineer
Acme
Jan 2020 - ${marker}
- Built things`;
      const result = parseCVFallback(text);
      expect(result.parsed.experience[0]?.endDate).toBe("Present");
      expect(result.parsed.experience[0]?.current).toBe(true);
    }
  });

  it("assembles labelled experience entries", () => {
    const text = `Jane Doe
jane@example.com
(555) 123-4567

WORKING EXPERIENCE
Institute: State University
Job Title: Lecturer
Duration: Fall 2014 - To date
Teaching
- Algebra
- Calculus`;
    const result = parseCVFallback(text);
    expect(result.parsed.experience).toHaveLength(1);
    const job = result.parsed.experience[0]!;
    expect(job.position).toBe("Lecturer");
    expect(job.company).toBe("State University");
    expect(job.startDate).toBe("2014-09");
    expect(job.endDate).toBe("Present");
    expect(job.bullets.length).toBeGreaterThanOrEqual(2);
  });

  it("parses filled-marker skill categories with wrapped items", () => {
    const text = `Jane Doe
jane@example.com
(555) 123-4567

SKILLS
● Languages
○ Python, Go
● Infrastructure
○ Docker,
Kubernetes`;
    const result = parseCVFallback(text);
    expect(result.parsed.skillGroups).toHaveLength(2);
    expect(result.parsed.skillGroups[0]?.category).toBe("Languages");
    expect(result.parsed.skillGroups[0]?.skills).toEqual(["Python", "Go"]);
    expect(result.parsed.skillGroups[1]?.category).toBe("Infrastructure");
    expect(result.parsed.skillGroups[1]?.skills).toEqual(["Docker", "Kubernetes"]);
  });

  it("back-fills the employer onto stacked roles at one company", () => {
    const text = `Jane Doe
jane@example.com
(555) 123-4567

EXPERIENCE
Senior Architect Jan 2022 - Sep 2022
DevOps Architect Jan 2020 - Jan 2022
Acme Ltd
- Designed systems
DevOps Engineer Jan 2018 - Dec 2019
Acme Ltd
- Automated deploys`;
    const result = parseCVFallback(text);
    expect(result.parsed.experience).toHaveLength(3);
    const companies = result.parsed.experience.map((e) => e.company);
    expect(companies).toEqual(["Acme Ltd", "Acme Ltd", "Acme Ltd"]);
  });
});

describe("parseCVFallback — confidence gate and labelled contacts", () => {
  it("flags placeholder templates as low confidence", () => {
    const text = `Forename SURNAME
Job title
Company name
Please use 3-4 bullets maximum`;
    const result = parseCVFallback(text);
    expect(result.lowConfidence).toBe(true);
  });

  it("does not flag a normal CV as low confidence", () => {
    const result = parseCVFallback(SAMPLE_RESUME);
    expect(result.lowConfidence).toBe(false);
  });

  it("reads labelled contact fields from the header", () => {
    const text = `John Smith
PERSONAL DETAILS
Name: John Smith
Email: john@example.com
Mobile: +1 555 123 4567
Home Address: 1 Main Street`;
    const result = parseCVFallback(text);
    expect(result.parsed.name).toBe("John Smith");
    expect(result.parsed.email).toBe("john@example.com");
    expect(result.parsed.phone.replace(/\D/g, "")).toContain("5551234567");
    expect(result.parsed.location).toBe("1 Main Street");
    expect(result.lowConfidence).toBe(false);
  });
});

describe("parseCVFallback — certifications", () => {
  it("joins wrapped credential names and drops category headings", () => {
    const text = `Jane Doe
jane@example.com
(555) 123-4567

CERTIFICATIONS
● Cloud & Kubernetes
○ AWS Solutions Architect -
Associate
○ CKA - Kubernetes Administrator`;
    const result = parseCVFallback(text);
    const names = result.parsed.certifications.map((c) => c.name);
    expect(names).toContain("AWS Solutions Architect - Associate");
    expect(names).toContain("CKA - Kubernetes Administrator");
    expect(names).not.toContain("Cloud & Kubernetes");
  });
});
