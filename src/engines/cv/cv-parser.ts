/**
 * AI-first CV parser with regex fallback.
 * Uses OpenAI (or compatible) to semantically parse messy PDF-extracted text.
 * Falls back to regex-based extraction when no API key is configured.
 */

import { generateText } from "ai";
// @ts-expect-error — @ai-sdk/openai optional
import { openai } from "@ai-sdk/openai";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ParsedExperience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  technologies: string[];
}

export interface ParsedEducation {
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  honors: string[];
}

export interface ParsedProject {
  name: string;
  role: string;
  description: string;
  technologies: string[];
  url: string;
  highlights: string[];
}

export interface ParsedCertification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface ParsedLanguage {
  language: string;
  proficiency: string;
}

export interface ParsedSkillGroup {
  category: string;
  skills: string[];
}

export interface ParsedCV {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skillGroups: ParsedSkillGroup[];
  experience: ParsedExperience[];
  education: ParsedEducation[];
  projects: ParsedProject[];
  certifications: ParsedCertification[];
  languages: ParsedLanguage[];
}

export interface ParseResult {
  parsed: ParsedCV;
}

export interface ParseCVOptions {
  layout?: "single" | "two-column";
  numPages?: number;
  quality?: "high" | "low";
}

// ─── AI System Prompt ──────────────────────────────────────────────────────

const AI_SYSTEM_PROMPT = `You are an expert Resume Parsing Engine. Your task is to convert raw, messy text extracted from a PDF resume into a strict, clean JSON structure.

RULES:
1. **NO HALLUCINATION**: Only extract information that is explicitly stated in the text. If a field is missing, set it to \`null\` or an empty array \`[]\`.
2. **Handle Jumbled Layouts**: The input text may have columns rendered incorrectly (e.g., left column first, then right column). Use semantic reasoning to re-connect dates to job titles and descriptions.
3. **Date Standardization**: Convert all dates to \`YYYY-MM\` format. If only a year is given (e.g., "2020"), use \`2020-01\`. If a range (e.g., "Jan 2020 - Present"), output \`{ start: "2020-01", end: null }\`.
4. **Skill Extraction**: Extract hard skills (technologies, frameworks, languages) and soft skills separately. Do not include generic buzzwords like "Team Player" unless they are explicitly listed in a "Skills" section.
5. **Education**: Include degree, institution, and graduation year.
6. **Clean Text**: Remove excessive whitespace, random dashes (-----), and non-printable characters.
7. **Output Format**: Respond ONLY with valid JSON. Do not wrap it in markdown code blocks. The JSON must match the schema exactly.`;

// ─── AI-powered parsing ─────────────────────────────────────────────────────

/** Schema returned by the AI */
interface AIParseResult {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  summary: string | null;
  skills: { hard: string[]; soft: string[] };
  experience: Array<{
    company: string;
    title: string;
    start_date: string | null;
    end_date: string | null;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field_of_study: string | null;
    graduation_date: string | null;
  }>;
  certifications: string[] | null;
}

function mapAIResult(ai: AIParseResult): ParsedCV {
  const skillGroups: ParsedSkillGroup[] = [];
  if (ai.skills.hard?.length) skillGroups.push({ category: "Technical Skills", skills: ai.skills.hard });
  if (ai.skills.soft?.length) skillGroups.push({ category: "Soft Skills", skills: ai.skills.soft });

  return {
    name:     ai.name ?? "",
    email:    ai.email ?? "",
    phone:    ai.phone ?? "",
    location: ai.location ?? "",
    linkedin: ai.linkedin ?? "",
    github:   "",
    website:  "",
    summary:  ai.summary ?? "",
    skillGroups,
    experience: (ai.experience ?? []).map((e) => ({
      company:      e.company ?? "",
      position:     e.title ?? "",
      location:     "",
      startDate:    e.start_date ?? "",
      endDate:      e.end_date ?? "",
      current:      e.current ?? false,
      bullets:      (e.description ?? "").split(/[.;]\s*/).filter(Boolean),
      technologies: [],
    })),
    education: (ai.education ?? []).map((e) => ({
      institution: e.institution ?? "",
      degree:      e.degree ?? "",
      field:       e.field_of_study ?? "",
      location:    "",
      startDate:   "",
      endDate:     e.graduation_date ?? "",
      gpa:         "",
      honors:      [],
    })),
    projects: [],
    certifications: (ai.certifications ?? []).map((c) => ({
      name: typeof c === "string" ? c : "",
      issuer: "", date: "", url: "",
    })),
    languages: [],
  };
}

export async function parseCV(
  rawText: string,
  options?: ParseCVOptions,
): Promise<ParseResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return parseCVFallback(rawText);
  }

  const layout  = options?.layout ?? "single";
  const pages   = options?.numPages ?? 1;
  const quality = options?.quality ?? (rawText.length > 500 ? "high" : "low");

  try {
    const userPrompt = `Parse the following raw resume text. Pay special attention to reconstructing lines that may have been split by PDF extraction errors.

Debug context:
- Layout detected: ${layout}
- Number of pages: ${pages}
- Extraction quality: ${quality}

Raw text:
"""${rawText}"""

Output JSON schema:
{
  "name": "string | null",
  "email": "string | null",
  "phone": "string | null",
  "location": "string | null",
  "linkedin": "string | null",
  "summary": "string | null",
  "skills": { "hard": ["string"], "soft": ["string"] },
  "experience": [
    {
      "company": "string",
      "title": "string",
      "start_date": "YYYY-MM | null",
      "end_date": "YYYY-MM | null",
      "current": "boolean",
      "description": "string (concatenate all bullet points into a single paragraph)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field_of_study": "string | null",
      "graduation_date": "YYYY-MM | null"
    }
  ],
  "certifications": ["string"] | null
}`;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: AI_SYSTEM_PROMPT,
      prompt: userPrompt,
      temperature: 0.0,
    });

    const aiResult: AIParseResult = JSON.parse(text);
    return { parsed: mapAIResult(aiResult) };
  } catch {
    return parseCVFallback(rawText);
  }
}

// ─── Fallback (regex) — helpers ─────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?[\d][\d\s\-().]{6,}[\d])/;
const URL_RE   = /(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+)/i;
const BULLET_RE = /^[•·○●\-–—*]\s*/;

const MONTH_MAP: Record<string, string> = {
  jan:"01", feb:"02", mar:"03", apr:"04", may:"05", jun:"06",
  jul:"07", aug:"08", sep:"09", oct:"10", nov:"11", dec:"12",
};

function toYYYYMM(raw: string): string {
  raw = raw.trim();
  // Already YYYY-MM
  if (/^\d{4}-\d{2}$/.test(raw)) return raw;
  // "2022-01" or "2022/01"
  const slash = raw.match(/^(\d{4})[/-](\d{2})$/);
  if (slash) return `${slash[1]}-${slash[2]}`;
  // "Jan 2022" or "January 2022"
  const month = raw.match(/([a-z]{3})[a-z]*[\s,.-]+(\d{4})/i);
  if (month) {
    const m = MONTH_MAP[month[1]!.toLowerCase().slice(0, 3)] ?? "01";
    return `${month[2]}-${m}`;
  }
  // Bare year
  const year = raw.match(/\b(20\d{2}|19\d{2})\b/);
  return year ? `${year[1]}-01` : raw;
}

const SECTION_HEADERS = [
  "SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT",
  "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY", "EMPLOYMENT",
  "EDUCATION", "ACADEMIC",
  "SKILLS", "TECHNICAL SKILLS", "SKILLS & TECHNOLOGIES", "CORE COMPETENCIES", "KEY SKILLS",
  "PROJECTS", "PERSONAL PROJECTS", "SIDE PROJECTS",
  "CERTIFICATIONS", "CERTIFICATES", "CREDENTIALS",
  "LANGUAGES",
  "AWARDS", "PUBLICATIONS", "VOLUNTEER", "INTERESTS", "REFERENCES",
] as const;

const SECTION_RE = new RegExp(
  `^(${SECTION_HEADERS.join("|")})\\s*:?\\s*$`,
  "i"
);

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = { HEADER: [] };
  let current = "HEADER";
  for (const line of lines) {
    if (SECTION_RE.test(line)) {
      current = line.replace(/:$/, "").trim().toUpperCase();
      if (!sections[current]) sections[current] = [];
    } else {
      if (!sections[current]) sections[current] = [];
      sections[current]!.push(line);
    }
  }
  return sections;
}

function getSection(sections: Record<string, string[]>, ...keys: string[]): string[] {
  for (const k of keys) {
    const found = sections[k] ?? sections[k.toUpperCase()];
    if (found && found.length > 0) return found;
  }
  return [];
}

// ─── Main parser (regex fallback) ──────────────────────────────────────────

function parseCVFallback(rawText: string): ParseResult {
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections = splitSections(lines);

  const name     = parseName(lines);
  const email    = rawText.match(EMAIL_RE)?.[0] ?? "";
  const phone    = rawText.match(PHONE_RE)?.[1] ?? "";
  const location = parseLocation(getSection(sections, "HEADER").join(" "), rawText);
  const { linkedin, github, website } = parseURLs(rawText);
  const summary  = getSection(sections, "SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT").join(" ").trim();

  const skillGroups = parseSkills(
    getSection(sections, "SKILLS", "TECHNICAL SKILLS", "SKILLS & TECHNOLOGIES", "CORE COMPETENCIES", "KEY SKILLS")
  );

  const experience = parseExperience(
    getSection(sections, "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY", "EMPLOYMENT")
  );

  const education = parseEducation(getSection(sections, "EDUCATION", "ACADEMIC"));

  const projects = parseProjects(
    getSection(sections, "PROJECTS", "PERSONAL PROJECTS", "SIDE PROJECTS")
  );

  const certifications = parseCertifications(
    getSection(sections, "CERTIFICATIONS", "CERTIFICATES", "CREDENTIALS")
  );

  const languages = parseLanguages(getSection(sections, "LANGUAGES"));

  const parsed: ParsedCV = {
    name, email, phone, location, linkedin, github, website,
    summary, skillGroups, experience, education,
    projects, certifications, languages,
  };

  return { parsed };
}

// ─── Section parsers ───────────────────────────────────────────────────────

function parseName(lines: string[]): string {
  // First non-empty line that doesn't look like contact info
  for (const line of lines.slice(0, 5)) {
    if (!EMAIL_RE.test(line) && !PHONE_RE.test(line) && line.length < 60) {
      return line;
    }
  }
  return "";
}

function parseLocation(headerText: string, fullText: string): string {
  const m = (headerText || fullText).match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]{1,})/);
  return m?.[1]?.trim() ?? "";
}

function parseURLs(text: string): { linkedin: string; github: string; website: string } {
  let linkedin = "", github = "", website = "";
  for (const m of text.matchAll(new RegExp(URL_RE.source, "gi"))) {
    if (m[0].includes("linkedin")) linkedin = m[0];
    else if (m[0].includes("github")) github = m[0];
  }
  const web = text.match(/https?:\/\/(?!linkedin|github)[\w.-]+\.[a-z]{2,}[\w/.-]*/i);
  if (web) website = web[0];
  return { linkedin, github, website };
}

function parseSkills(lines: string[]): ParsedSkillGroup[] {
  const groups: ParsedSkillGroup[] = [];
  let currentCategory = "General";
  let currentSkills: string[] = [];

  const isCategoryHeader = (line: string) =>
    line.length < 50 &&
    !BULLET_RE.test(line) &&
    !line.includes(",") &&
    (/^[A-Z]/.test(line) || line === line.toUpperCase());

  for (const line of lines) {
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    if (isCategoryHeader(stripped) && !stripped.match(/^(and|or|the|in|on|with|for)$/i)) {
      if (currentSkills.length > 0) {
        groups.push({ category: currentCategory, skills: [...currentSkills] });
      }
      currentCategory = stripped.replace(/:$/, "").trim();
      currentSkills = [];
    } else {
      // Handle sub-bullets (○) as skill items
      const items = stripped
        .split(/[,;|]/)
        .map((s) => s.replace(/^[○•·]\s*/, "").trim())
        .filter((s) => s.length > 0 && s.length < 60);
      currentSkills.push(...items);
    }
  }

  if (currentSkills.length > 0) {
    groups.push({ category: currentCategory, skills: currentSkills });
  }

  return groups;
}

const DATE_RANGE_RE = /(.+?)\s*[-–—]\s*(present|current|\d[\d\s\w,.-]+)/i;

function parseExperience(lines: string[]): ParsedExperience[] {
  const entries: ParsedExperience[] = [];
  let current: ParsedExperience | null = null;

  const flush = () => { if (current) entries.push(current); };

  for (let i = 0; i < lines.length; i++) {
    const line  = lines[i]!;
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    const isBullet = BULLET_RE.test(line);

    // Date-range line  e.g.  "Oct 2022 – June 2025"  or  "2022-10 – Present"
    if (!isBullet && DATE_RANGE_RE.test(stripped) && /\b(20|19)\d{2}\b/.test(stripped)) {
      const dm = stripped.match(DATE_RANGE_RE)!;
      if (current) {
        current.startDate = toYYYYMM(dm[1]!);
        current.endDate   = /present|current/i.test(dm[2]!) ? "Present" : toYYYYMM(dm[2]!);
        current.current   = /present|current/i.test(dm[2]!);
      }
      continue;
    }

    // Bullet → belongs to current job
    if (isBullet) {
      if (current) current.bullets.push(stripped);
      continue;
    }

    // Company/location line  e.g.  "KM.ON by Karyl Mayer, Hong Kong"
    // Heuristic: short line, no dates, follows a job title already set
    if (current && !current.company && stripped.length < 80) {
      current.company  = stripped.split(",")[0]?.trim() ?? stripped;
      current.location = stripped.includes(",") ? stripped.split(",").slice(1).join(",").trim() : "";
      continue;
    }

    // New job title line — looks like capitalised words, not a bullet
    if (/^[A-Z]/.test(stripped) && stripped.length < 80) {
      flush();
      current = {
        company: "", position: stripped, location: "",
        startDate: "", endDate: "", current: false,
        bullets: [], technologies: [],
      };
      continue;
    }

    if (current) current.bullets.push(stripped);
  }

  flush();
  return entries;
}

function parseEducation(lines: string[]): ParsedEducation[] {
  const entries: ParsedEducation[] = [];
  let current: ParsedEducation | null = null;

  const flush = () => { if (current) entries.push(current); };

  for (const line of lines) {
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    if (/gpa/i.test(stripped)) {
      const gm = stripped.match(/[\d.]+/);
      if (current && gm) { current.gpa = gm[0]; continue; }
    }

    if (!DATE_RANGE_RE.test(stripped) && /\b(20|19)\d{2}\b/.test(stripped)) {
      const dm = stripped.match(/(\d{4}[-/]\d{2}|\w+ \d{4})\s*[-–—]\s*(\d{4}[-/]\d{2}|\w+ \d{4}|present)/i);
      if (dm && current) {
        current.startDate = toYYYYMM(dm[1]!);
        current.endDate   = toYYYYMM(dm[2]!);
        continue;
      }
    }

    if (/bachelor|master|phd|b\.sc|m\.sc|b\.s\b|m\.s\b|b\.a\b|m\.a\b|b\.e\b|m\.e\b|b\.tech|m\.tech|diploma|associate/i.test(stripped)) {
      flush();
      const field = stripped.match(/(?:of|in)\s+([^,]+)/i)?.[1]?.trim() ?? "";
      current = { institution: "", degree: stripped, field, location: "", startDate: "", endDate: "", gpa: "", honors: [] };
    } else if (current && !current.institution) {
      current.institution = stripped;
    } else {
      flush();
      current = { institution: stripped, degree: "", field: "", location: "", startDate: "", endDate: "", gpa: "", honors: [] };
    }
  }

  flush();
  return entries;
}

function parseProjects(lines: string[]): ParsedProject[] {
  const entries: ParsedProject[] = [];
  let current: ParsedProject | null = null;

  for (const line of lines) {
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    if (BULLET_RE.test(line)) {
      if (current) current.highlights.push(stripped);
    } else {
      if (current) entries.push(current);
      const urlMatch = stripped.match(/https?:\/\/\S+/);
      current = {
        name: stripped.replace(/https?:\/\/\S+/g, "").trim(),
        role: "", description: "", technologies: [],
        url: urlMatch?.[0] ?? "", highlights: [],
      };
    }
  }
  if (current) entries.push(current);
  return entries;
}

function parseCertifications(lines: string[]): ParsedCertification[] {
  return lines
    .map((l) => l.replace(BULLET_RE, "").trim())
    .filter((l) => l.length > 0)
    .map((name) => ({ name, issuer: "", date: "", url: "" }));
}

function parseLanguages(lines: string[]): ParsedLanguage[] {
  return lines
    .flatMap((l) => l.split(/[,;]/))
    .map((l) => {
      const m = l.match(/^([^(]+)\(([^)]+)\)/);
      return m
        ? { language: m[1]!.trim(), proficiency: m[2]!.trim() }
        : { language: l.trim(), proficiency: "" };
    })
    .filter((l) => l.language.length > 0 && l.language.length < 40);
}
