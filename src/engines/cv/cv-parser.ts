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
// Phone: optional +country, optional (area) groups, 7+ digits total, separators allowed.
// Anchored so we don't capture phone-like fragments from longer numeric strings.
const PHONE_RE = /(\+?\d{1,3}[\s.-]?)?(\(\d{2,4}\)[\s.-]?)?\d{2,4}([\s.-]?\d{2,4}){1,3}/;
const URL_RE   = /(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+|[\w-]+\.[\w-]+\.[a-z]{2,})/i;
const BULLET_RE = /^[•·○●\-–—*►▸]\s*/;
const GITHUB_RE = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/i;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i;

// Smart-dash and quote normalisation so downstream regexes don't have to repeat
// the unicode character class everywhere.
function normaliseText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\u2013|\u2014/g, "-") // en/em dash → hyphen for matching
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/[ \t]{2,}/g, " ");    // only collapse horizontal whitespace, NEVER \n
}

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
  "CONTACT", "CONTACTS", "GET IN TOUCH",
] as const;

const SECTION_RE = new RegExp(
  `^(${SECTION_HEADERS.join("|")})\\s*:?\\s*$`,
  "i"
);

/**
 * Returns the canonical section header name if the line matches a known
 * section header (case-insensitive, ignoring punctuation and letter-spacing).
 *
 * Modern CV templates often render section titles with letter-spacing:
 *   "E X P E R I E N C E" → after stripping spaces → "EXPERIENCE"
 */
function matchSectionHeader(line: string): string | null {
  const stripped = line.replace(/[:|\-–—]/g, "").replace(/\s+/g, "").toUpperCase();
  if (!stripped) return null;
  for (const header of SECTION_HEADERS) {
    if (stripped === header.replace(/\s+/g, "").toUpperCase()) {
      return header.toUpperCase();
    }
  }
  return null;
}

function splitSections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = { HEADER: [] };
  let current = "HEADER";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if this line is a section header (normal or letter-spaced).
    const header = matchSectionHeader(trimmed);
    if (header) {
      current = header;
      if (!sections[current]) sections[current] = [];
      continue;
    }

    // Also accept the SECTION_RE form for backwards compatibility.
    if (SECTION_RE.test(trimmed)) {
      current = trimmed.replace(/[:|\-–—]/g, "").trim().toUpperCase();
      if (!sections[current]) sections[current] = [];
      continue;
    }

    if (!sections[current]) sections[current] = [];
    sections[current]!.push(trimmed);
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

export function parseCVFallback(rawText: string, _options?: ParseCVOptions): ParseResult {
  const cleanedText = normaliseText(rawText).trim();
  const lines = cleanedText.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections = splitSections(lines);

  const name     = parseName(lines);
  const email    = rawText.match(EMAIL_RE)?.[0] ?? "";
  const phone    = extractPhone(rawText);
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

function extractPhone(rawText: string): string {
  // Scan for phone-like tokens. Pick the first that contains 7+ digits and
  // isn't a year or date fragment (year ranges and graduation years are too
  // easy to mis-capture otherwise).
  // Optional leading ( + or ( and 7+ digits total, with separators allowed.
  const candidates = rawText.match(/\+?\d[\d\s().\-]{6,}\d|\(\d{2,4}\)[\s.\-]?\d{2,4}[\s.\-]?\d{2,4}/g) ?? [];
  for (const cand of candidates) {
    const digits = cand.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 16) continue;
    if (/^\d{4}$/.test(digits)) continue;
    if (/^\d{4}\s*-\s*\d{4}$/.test(cand.trim())) continue;
    // Preserve as-is — the CV contained this exact representation.
    return cand.trim();
  }
  return "";
}

function parseName(lines: string[]): string {
  // Walk the first 8 lines and collect short capitalised fragments until
  // we hit something that looks like contact info. This handles multi-line
  // names like "Maria\nGarcia" produced by sidebar-style CVs.
  const parts: string[] = [];
  for (const line of lines.slice(0, 8)) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (EMAIL_RE.test(trimmed) || PHONE_RE.test(trimmed) || URL_RE.test(trimmed)) break;
    if (trimmed.length > 60) break;
    if (SECTION_RE.test(trimmed)) break;
    // Looks like contact line "key: value" or contains separators
    if (/[:|]/.test(trimmed) && trimmed.length > 20) break;
    // A line that is a single short capitalised word/phrase — accumulate
    parts.push(trimmed);
    if (parts.length >= 3) break;
  }
  return parts.join(" ").trim();
}

function parseLocation(headerText: string, fullText: string): string {
  // Try headerText first (typically the contact lines at the top of the
  // document); fall back to fullText if that has no match. fullText covers
  // sidebar-style CVs where contact info lives in a dedicated section
  // (CONTACT) that's no longer part of the "HEADER" bucket.
  const RE = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)(?=\s+(?:linkedin|github|email|phone|tel|portfolio|website|blog|twitter|x\.com)|\s*$|\.|,)/i;
  const candidates = [
    (headerText ?? "").replace(/[\n|]+/g, " "),
    (fullText ?? "").replace(/[\n|]+/g, " ").slice(0, 2000),
  ];
  for (const c of candidates) {
    const m = c.match(RE);
    if (m) {
      let loc = `${m[1]}, ${m[2]}`.trim();
      loc = loc.replace(/[.,;]+$/, "").trim();
      return loc;
    }
  }
  return "";
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

  // Detect a single "Category:" label (no skills on same line).
  const isLoneCategoryLabel = (line: string): string | null => {
    if (BULLET_RE.test(line)) return null;
    const colonIdx = line.indexOf(":");
    if (colonIdx <= 0 || colonIdx !== line.length - 1) return null;
    const head = line.slice(0, colonIdx).trim();
    if (head.length === 0 || head.length > 40) return null;
    if (!/[A-Za-z]/.test(head)) return null;
    if (/[.!?]$/.test(head)) return null;
    return head;
  };

  const pushCurrent = () => {
    if (currentSkills.length > 0) {
      groups.push({ category: currentCategory, skills: [...currentSkills] });
    }
    currentSkills = [];
  };

  /**
   * Split a single line that may contain one OR MORE embedded category
   * headers, e.g.:
   *   "Languages: Python, Go Backend: Django, FastAPI Infra: ..."
   * Returns true if at least one category was extracted and the line was
   * consumed; the caller should `continue`.
   */
  const splitEmbeddedCategories = (line: string): boolean => {
    // Single-word category headers only (e.g. "Languages:", "Backend:",
    // "Data:"). Multi-word names like "Kotlin Backend" should not match —
    // they bleed into the previous category's skill list.
    const headerRe = /\b([A-Z][A-Za-z]{1,30}):/g;
    const matches: { header: string; index: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = headerRe.exec(line)) !== null) {
      matches.push({ header: m[1]!.trim(), index: m.index });
    }
    if (matches.length === 0) return false;
    if (matches[0]!.index > 0) return false;

    pushCurrent();

    // Collect all chunks first to preserve order, then push to groups.
    const chunks: { category: string; skills: string[] }[] = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i]!.index;
      const end = i + 1 < matches.length ? matches[i + 1]!.index : line.length;
      const chunk = line.slice(start, end).trim();
      const colonAt = chunk.indexOf(":");
      const category = chunk.slice(0, colonAt).trim();
      const tail = chunk.slice(colonAt + 1).trim();
      const skills = tail
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 60);
      chunks.push({ category, skills });
    }

    // Push all but the last into groups, and keep the last in current so
    // the loop's tail-push works. Actually push them all into groups in
    // order, then clear current.
    for (const c of chunks) {
      groups.push({ category: c.category, skills: c.skills });
    }
    currentCategory = "General";
    currentSkills = [];
    return true;
  };

  for (const line of lines) {
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    // Embedded categories — one or more "Category: ..." chunks on the line.
    if (splitEmbeddedCategories(stripped)) continue;

    // Lone category label: "Languages:"
    const lone = isLoneCategoryLabel(stripped);
    if (lone) {
      pushCurrent();
      currentCategory = lone;
      continue;
    }

    // Default: append skills to current group
    const items = stripped
      .split(/[,;|]/)
      .map((s) => s.replace(/^[○•·]\s*/, "").trim())
      .filter((s) => s.length > 0 && s.length < 60);
    currentSkills.push(...items);
  }

  if (currentSkills.length > 0) {
    groups.push({ category: currentCategory, skills: currentSkills });
  }

  return groups;
}

const DATE_RANGE_RE = /(\d{4}|\w+\s+\d{4}|\d{4}[-/]\d{2})\s*[-–—]\s*(\d{4}|\w+\s+\d{4}|\d{4}[-/]\d{2}|present|current)/i;

// Company/location separator: comma, em/en dash, pipe, or newline (already split).
const COMPANY_LOC_SEP_RE = /\s*[,\-|]\s*|\s+—\s+|\s+–\s+/;
const LOCATION_KEYWORDS_RE = /\b(USA|Canada|UK|US|U\.S\.A\.|U\.S\.|Remote|Hybrid|On-site|Onsite|Europe|Asia|Africa|Australia|New York|California|Texas|London|Paris|Berlin|Tokyo|Singapore|Bengaluru|Bangalore|Sydney|Toronto|Vancouver|Mumbai|Delhi|Remote|Hybrid)\b/i;

/**
 * Match a date range anywhere in a line and return start/end, or null.
 * Used to detect single-line "Role — Company Jan 2020 - Present" headers.
 */
function extractDateRange(line: string): { start: string; end: string; current: boolean; matchIndex: number } | null {
  // Match a date-range token anywhere; we want the rightmost one (typical
  // when the line is "Role — Company Jan 2020 - Present").
  const re = /((?:\d{4}(?:[-/]\d{2})?)|(?:\w+\.?\s+\d{4}))\s*[-–—]\s*((?:\d{4}(?:[-/]\d{2})?)|(?:\w+\.?\s+\d{4})|present|current)/gi;
  let m: RegExpExecArray | null;
  let lastMatch: { start: string; end: string; current: boolean; matchIndex: number } | null = null;
  while ((m = re.exec(line)) !== null) {
    lastMatch = {
      start: toYYYYMM(m[1]!),
      end:   /present|current/i.test(m[2]!) ? "Present" : toYYYYMM(m[2]!),
      current: /present|current/i.test(m[2]!),
      matchIndex: m.index,
    };
  }
  return lastMatch;
}

function isLikelyPositionTitle(line: string): boolean {
  // A position title is short, capitalised, doesn't look like a date or
  // company line, and isn't a sentence (no terminal period, no commas).
  if (line.length < 3 || line.length > 50) return false;
  if (/[.!?]$/.test(line)) return false;
  if (extractDateRange(line)) return false;
  // Real position titles are a single phrase with no commas.
  if (line.includes(",")) return false;
  // Reject if it looks like company/location pair
  if (COMPANY_LOC_SEP_RE.test(line) && /\b(Inc|LLC|Ltd|Corp|Co\.|GmbH|SAS|S\.A\.|Pvt|Limited|Technologies|Solutions|Labs|Studios)\b/i.test(line)) {
    return false;
  }
  // Must start with a capital letter and contain at least one letter.
  if (!/^[A-Z]/.test(line)) return false;
  if (!/[A-Za-z]/.test(line)) return false;
  return true;
}

function parseExperience(lines: string[]): ParsedExperience[] {
  const entries: ParsedExperience[] = [];
  let current: ParsedExperience | null = null;

  const flush = () => {
    if (current && (current.position || current.company)) {
      entries.push(current);
    }
  };

  const blank = (): ParsedExperience => ({
    company: "",
    position: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [],
    technologies: [],
  });

  for (let i = 0; i < lines.length; i++) {
    const line  = lines[i]!;
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    const isBullet = BULLET_RE.test(line);

    // Standalone date-range line: "Oct 2022 – June 2025", "2022-10 – Present".
    // Only treat as standalone if the line is essentially just a date range.
    // Otherwise fall through to the combined-header detection below.
    const dm = !isBullet ? stripped.match(DATE_RANGE_RE) : null;
    const dateRangeIsOnlyContent = dm && stripped.replace(DATE_RANGE_RE, "").replace(/[,\s]+/g, "").length === 0;
    if (dateRangeIsOnlyContent && /\b(20|19)\d{2}\b/.test(stripped)) {
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

    // Combined header line: "Engineering Manager — Stripe  Jan 2022 - Present"
    // We split off the date range at the end and treat the rest as
    // "Position — Company [Location]". Common in modern compact layouts.
    // Also handles the case where the *previous* line already supplied
    // the position and this line supplies "Company, Location | Dates".
    {
      const dateMatch = extractDateRange(stripped);
      if (dateMatch) {
        const head = stripped.slice(0, dateMatch.matchIndex).trim().replace(/[\s,|]+$/, "");
        const { start, end, current: isCurrent } = dateMatch;

        // If we already have a partial entry (position set, company empty,
        // no dates yet), update it instead of creating a new one.
        const isFillingPrevious = !!(
          current &&
          current.position &&
          !current.company &&
          !current.startDate &&
          current.bullets.length === 0
        );

        if (!isFillingPrevious) {
          flush();
          current = blank();
        }

        current!.startDate = start;
        current!.endDate   = end;
        current!.current   = isCurrent;

        if (isFillingPrevious) {
          // The previous line gave us position; this line supplies the
          // company/location. Try to extract it from the head.
          const companyText = head;
          const tailParts = companyText.split(/\s*,\s*/);
          if (tailParts.length > 1) {
            current!.company  = tailParts[0] ?? companyText;
            current!.location = tailParts.slice(1).join(", ").trim();
          } else {
            current!.company = companyText;
          }
        } else {
          // Split head into position and company. Accept hyphen, em-dash,
          // en-dash, or pipe as the separator.
          let positionText = head;
          let companyText  = "";
          const sepMatch = head.match(/^(.+?)\s+[-—–|]\s+(.+)$/);
          if (sepMatch) {
            positionText = sepMatch[1]!.trim();
            companyText  = sepMatch[2]!.trim();
          }
          current!.position = positionText;

          if (companyText) {
            const tailParts = companyText.split(/\s*,\s*/);
            if (tailParts.length > 1) {
              current!.company  = tailParts[0] ?? companyText;
              current!.location = tailParts.slice(1).join(", ").trim();
            } else {
              current!.company = companyText;
            }
          }
        }
        continue;
      }
    }

    // Company/location line. Conditions:
    //   - We have a current entry whose position is set but company is empty
    //   - The line has a separator (comma, dash, pipe, en/em dash) OR
    //     contains a known location keyword
    //   - Length is sane
    //   - We haven't started collecting bullets yet (otherwise this line
    //     is most likely a new section or stray content).
    if (
      current &&
      current.position &&
      !current.company &&
      current.bullets.length === 0 &&
      stripped.length < 100 &&
      (COMPANY_LOC_SEP_RE.test(stripped) || LOCATION_KEYWORDS_RE.test(stripped))
    ) {
      const parts = stripped.split(COMPANY_LOC_SEP_RE);
      current.company  = parts[0]?.trim() ?? stripped;
      current.location = parts.length > 1 ? parts.slice(1).join(", ").trim() : "";
      continue;
    }

    // Just after a combined-header with single-token company, the next
    // line is most likely the city/location. If it looks like a location
    // (has location keywords, no company-suffix keywords like Inc/Corp),
    // set it as location only — don't replace the company we already have.
    if (
      current &&
      current.position &&
      current.company &&
      current.location === "" &&
      current.bullets.length === 0 &&
      stripped.length < 100 &&
      (COMPANY_LOC_SEP_RE.test(stripped) || LOCATION_KEYWORDS_RE.test(stripped))
    ) {
      // The line looks like a city/state rather than a new company if:
      //   - it has a location keyword, OR
      //   - it has no obvious company-suffix (Inc, LLC, Ltd, Corp, Co., ...)
      const hasCompanySuffix = /\b(Inc|LLC|Ltd|Corp|Co\.|GmbH|Limited|Technologies|Solutions|Labs|Studios|S\.A\.|Pvt|Group|Holdings)\b/i.test(stripped);
      const hasLocationHint  = LOCATION_KEYWORDS_RE.test(stripped) || /\(\s*(Remote|Hybrid|On-site|Onsite)\s*\)/i.test(stripped);
      if (hasLocationHint || !hasCompanySuffix) {
        current.location = stripped.trim();
        continue;
      }
    }

    // New job title line.
    //
    // Rule: flush the previous entry and start fresh UNLESS the current
    // entry is "open" (no bullets yet AND no dates yet) — in that case
    // this line is likely another bullet that just happens to look like
    // a title.
    if (isLikelyPositionTitle(stripped)) {
      const isOpenEntry = current && current.bullets.length === 0 && !current.startDate;
      if (isOpenEntry && current) {
        // Treat as bullet of the previous (still-being-built) entry.
        if (current.position && !current.company) {
          current.company = stripped;
        } else if (current.position) {
          current.bullets.push(stripped);
        }
        continue;
      }
      flush();
      current = blank();
      current!.position = stripped;
      continue;
    }

    // If the current entry is "filled" (position + dates set) and we've
    // already started collecting bullets, treat subsequent non-bullet,
    // non-date, non-position-title lines as additional bullets. This
    // matters for compact CVs (like the modern layout) where bullets have
    // no bullet symbol.
    if (
      current &&
      current.position &&
      current.startDate &&
      current.bullets.length > 0 &&
      !isLikelyPositionTitle(stripped)
    ) {
      current.bullets.push(stripped);
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

  const blankEdu = (): ParsedEducation => ({
    institution: "",
    degree: "",
    field: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    honors: [],
  });

  // Generic date-range detector for education. Matches:
  //   "2013 - 2017", "2013 – 2017", "Aug 2018 – May 2022", "2013",
  //   "2020 - Present", "Sep 2019 - Current"
  const EDU_DATE_RE = /((?:\d{4}(?:[-/]\d{2})?)|(?:\w+\.?\s+\d{4}))\s*[-–—]\s*((?:\d{4}(?:[-/]\d{2})?)|(?:\w+\.?\s+\d{4})|present|current|now)/i;
  const EDU_YEAR_RE = /^\s*(?:(?:from\s+)?(\d{4})\s*[-–—]\s*(\d{4}|present|current)|(\d{4}))\s*$/i;

  for (const line of lines) {
    const stripped = line.replace(BULLET_RE, "").trim();
    if (!stripped) continue;

    // GPA / honours line
    if (/gpa|grade/i.test(stripped)) {
      const gm = stripped.match(/[\d.]+/);
      if (current && gm) {
        current.gpa = gm[0];
        continue;
      }
    }

    // Honour line (starts with "Honors:" / "Honours:" / "Awards:")
    if (/^(honors?|honours?|awards?|achievements?)\s*:/i.test(stripped)) {
      const items = stripped.split(":")[1]?.split(/[,;|]/).map((s) => s.trim()).filter(Boolean) ?? [];
      if (current && items.length) {
        current.honors = items;
        continue;
      }
    }

    // Date range
    if (EDU_DATE_RE.test(stripped)) {
      const m = stripped.match(EDU_DATE_RE);
      if (m && current) {
        current.startDate = toYYYYMM(m[1]!);
        current.endDate   = /present|current/i.test(m[2]!) ? "Present" : toYYYYMM(m[2]!);
        continue;
      }
    } else if (EDU_YEAR_RE.test(stripped)) {
      const m = stripped.match(EDU_YEAR_RE);
      if (m && current) {
        if (m[1] && m[2]) {
          current.startDate = `${m[1]}-01`;
          current.endDate   = /present|current/i.test(m[2]) ? "Present" : `${m[2]}-01`;
        } else if (m[3]) {
          current.endDate = `${m[3]}-01`;
        }
        continue;
      }
    }

    // Degree line — triggers a new entry
    if (/bachelor|master|phd|doctorate|b\.sc|m\.sc|m\.s\b|m\.a\b|b\.s\b|b\.a\b|b\.e\b|m\.e\b|b\.tech|m\.tech|diploma|associate|degree|\bmsc\b|\bms\b|\bma\b|\bbsc\b|\bbs\b|\bba\b|\bmeng\b|\bmba\b/i.test(stripped)) {
      flush();

      // Single-line combined header: "B.S. Computer Science - Carnegie Mellon University 2011 - 2015"
      // Split out trailing date range first.
      const dateM = stripped.match(/((?:\d{4}(?:[-/]\d{2})?))\s*[-–—]\s*((?:\d{4}(?:[-/]\d{2})?)|present|current)/i);
      let headForParsing = stripped;
      let startStr = "";
      let endStr = "";
      if (dateM && dateM.index && dateM.index > 4) {
        const before = stripped.slice(0, dateM.index).trim().replace(/[,\s]+$/, "");
        headForParsing = before;
        startStr = toYYYYMM(dateM[1]!);
        endStr = /present|current/i.test(dateM[2]!) ? "Present" : toYYYYMM(dateM[2]!);
      }

      const field = (() => {
        // For "Bachelor of Science in Computer Science" → field =
        // "Computer Science". Take the text after the LAST " of " or
        // " in " marker that's NOT followed by another such marker.
        const lastMarker = headForParsing
          .split(/\s+(?:of|in)\s+/i)
          .filter(Boolean)
          .pop();
        return lastMarker ?? "";
      })();

      current = blankEdu();
      current.degree = headForParsing;
      current.field  = field;
      if (startStr) current.startDate = startStr;
      if (endStr)   current.endDate   = endStr;

      // If the head also contains an em/hyphen-separated institution
      // ("B.S. Computer Science - Carnegie Mellon University"), split it.
      const instMatch = headForParsing.match(/^(.+?)\s+[-—–]\s+(.+)$/);
      if (instMatch) {
        current.degree      = instMatch[1]!.trim();
        current.institution = instMatch[2]!.trim();
      }
      continue;
    }

    // First non-degree line is the institution
    if (current && !current.institution) {
      current.institution = stripped;
      continue;
    }

    // No active entry yet — start with institution
    if (!current) {
      flush();
      current = blankEdu();
      current.institution = stripped;
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
