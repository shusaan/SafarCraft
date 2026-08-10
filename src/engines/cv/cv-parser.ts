/**
 * Regex-based CV parser.
 * Uses pattern matching to extract structured data from PDF/DOCX text.
 * AI parsing is disabled for reliability and speed.
 */

// AI parsing disabled - using regex-based extraction only
// import { generateText } from "ai";
// import { openai } from "@ai-sdk/openai";

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

// ─── Main export function ──────────────────────────────────────────────────

export async function parseCV(
  rawText: string,
  options?: ParseCVOptions,
): Promise<ParseResult> {
  // AI parsing disabled - using regex-based extraction for better reliability and speed
  return parseCVFallback(rawText, options);
}

// ─── Regex patterns and helpers ────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
const PHONE_RE = /(\+?[\d][\d\s\-().]{7,}[\d])/;
const URL_RE   = /(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+|[\w-]+\.[\w-]+\.[a-z]{2,})/i;
const BULLET_RE = /^[•·○●\-–—*►▸]\s*/;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;

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
  "SUMMARY", "PROFILE", "OBJECTIVE", "ABOUT", "PROFESSIONAL SUMMARY",
  "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY", "EMPLOYMENT", "WORK HISTORY",
  "EDUCATION", "ACADEMIC", "ACADEMIC BACKGROUND", "EDUCATIONAL BACKGROUND",
  "SKILLS", "TECHNICAL SKILLS", "SKILLS & TECHNOLOGIES", "CORE COMPETENCIES", "KEY SKILLS", "COMPETENCIES",
  "PROJECTS", "PERSONAL PROJECTS", "SIDE PROJECTS", "KEY PROJECTS",
  "CERTIFICATIONS", "CERTIFICATES", "CREDENTIALS", "LICENSES",
  "LANGUAGES", "LANGUAGE SKILLS",
  "AWARDS", "HONORS", "PUBLICATIONS", "VOLUNTEER", "VOLUNTEERING", "INTERESTS", "REFERENCES", "HOBBIES",
] as const;

const SECTION_RE = new RegExp(
  `^(${SECTION_HEADERS.join("|")})\\s*:?\\s*$`,
  "i"
);

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = { HEADER: [] };
  let current = "HEADER";
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if this line is a section header
    if (SECTION_RE.test(trimmed)) {
      current = trimmed.replace(/[:|\-–—]/g, "").trim().toUpperCase();
      if (!sections[current]) sections[current] = [];
    } else {
      // Also check for underlined headers (header followed by ====== or ------)
      if (!sections[current]) sections[current] = [];
      sections[current]!.push(trimmed);
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

export function parseCVFallback(rawText: string, options?: ParseCVOptions): ParseResult {
  // Clean and normalize the text
  const cleanedText = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\t/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  
  const lines = cleanedText.split("\n").map((l) => l.trim()).filter(Boolean);
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
  for (const line of lines.slice(0, 8)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Skip if looks like email, phone, or URL
    if (EMAIL_RE.test(trimmed) || PHONE_RE.test(trimmed) || URL_RE.test(trimmed)) continue;
    
    // Skip if too long (likely not a name)
    if (trimmed.length > 60) continue;
    
    // Skip if contains section headers
    if (SECTION_RE.test(trimmed)) continue;
    
    // First line that passes all checks is likely the name
    return trimmed;
  }
  return "";
}

function parseLocation(headerText: string, fullText: string): string {
  const m = (headerText || fullText).match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]{1,})/);
  return m?.[1]?.trim() ?? "";
}

function parseURLs(text: string): { linkedin: string; github: string; website: string } {
  let linkedin = "", github = "", website = "";
  
  // Find LinkedIn
  const linkedinMatch = text.match(LINKEDIN_RE);
  if (linkedinMatch) {
    linkedin = linkedinMatch[0];
    if (!linkedin.startsWith("http")) linkedin = "https://" + linkedin;
  }
  
  // Find GitHub
  const githubMatch = text.match(GITHUB_RE);
  if (githubMatch) {
    github = githubMatch[0];
    if (!github.startsWith("http")) github = "https://" + github;
  }
  
  // Find personal website (not LinkedIn or GitHub)
  const webMatch = text.match(/https?:\/\/(?!linkedin|github)[\w.-]+\.[a-z]{2,}[\w/.-]*/i);
  if (webMatch) website = webMatch[0];
  
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

  const flush = () => { 
    if (current && (current.position || current.company)) {
      entries.push(current); 
    }
  };

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

    // Check if this looks like a company/location line (contains comma or location keywords)
    const hasLocationKeywords = /\b(USA|Canada|UK|US|Remote|Hybrid|On-site)\b/i.test(stripped);
    const hasComma = stripped.includes(",");
    
    if (current && !current.company && stripped.length < 100 && (hasComma || hasLocationKeywords)) {
      const parts = stripped.split(",");
      current.company  = parts[0]?.trim() ?? stripped;
      current.location = parts.length > 1 ? parts.slice(1).join(",").trim() : "";
      continue;
    }

    // New job title line — looks like capitalised words, not a bullet
    // Better heuristic: check if it's reasonably short and looks like a title
    if (/^[A-Z]/.test(stripped) && stripped.length < 100 && stripped.length > 2) {
      flush();
      current = {
        company: "", 
        position: stripped, 
        location: "",
        startDate: "", 
        endDate: "", 
        current: false,
        bullets: [], 
        technologies: [],
      };
      continue;
    }

    // If we have a current entry but no bullets yet, treat as description/bullet
    if (current && !current.bullets.length) {
      current.bullets.push(stripped);
    }
  }

  flush();
  return entries;
}

function parseEducation(lines: string[]): ParsedEducation[] {
  const entries: ParsedEducation[] = [];
  let current: ParsedEducation | null = null;

  const flush = () => { 
    if (current && (current.institution || current.degree)) {
      entries.push(current); 
    }
  };

  for (const line of lines) {
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    // Check for GPA
    if (/gpa|grade/i.test(stripped)) {
      const gm = stripped.match(/[\d.]+/);
      if (current && gm) { 
        current.gpa = gm[0]; 
        continue; 
      }
    }

    // Check for date ranges
    if (/\b(20|19)\d{2}\b/.test(stripped)) {
      const dm = stripped.match(/(\d{4}[-/]\d{2}|\w+\s+\d{4}|\d{4})\s*[-–—]?\s*(\d{4}[-/]\d{2}|\w+\s+\d{4}|\d{4}|present|current)?/i);
      if (dm && current) {
        current.startDate = toYYYYMM(dm[1]!);
        current.endDate   = dm[2] ? toYYYYMM(dm[2]) : "";
        continue;
      }
    }

    // Check for degree
    if (/bachelor|master|phd|doctorate|b\.sc|m\.sc|b\.s\b|m\.s\b|b\.a\b|m\.a\b|b\.e\b|m\.e\b|b\.tech|m\.tech|diploma|associate|degree/i.test(stripped)) {
      flush();
      const field = stripped.match(/(?:of|in)\s+([^,\d]+)/i)?.[1]?.trim() ?? "";
      current = { 
        institution: "", 
        degree: stripped, 
        field, 
        location: "", 
        startDate: "", 
        endDate: "", 
        gpa: "", 
        honors: [] 
      };
    } else if (current && !current.institution) {
      // This is likely the institution name
      current.institution = stripped;
    } else if (!current) {
      // Start with institution if no degree found yet
      flush();
      current = { 
        institution: stripped, 
        degree: "", 
        field: "", 
        location: "", 
        startDate: "", 
        endDate: "", 
        gpa: "", 
        honors: [] 
      };
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
