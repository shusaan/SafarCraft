import type { AIAction } from "@/types";

const GOAL_INSTRUCTIONS: Record<string, string> = {
  startup:
    "Target: tech startup. Prioritise impact, ownership, breadth, and velocity. " +
    "Highlight shipped products, initiative, and cross-functional collaboration.",
  faang:
    "Target: FAANG / Big Tech. Prioritise algorithmic complexity, scale, systems thinking, " +
    "and measurable metrics (latency, throughput, reliability). Use STAR format.",
  government:
    "Target: government. Prioritise compliance, process rigour, documentation, " +
    "stakeholder communication, and security clearances where relevant.",
  academia:
    "Target: academia. Prioritise publications, grants, teaching, conference talks, " +
    "and research methodology. Use formal tone.",
};

const PROMPTS: Record<AIAction, string> = {
  "improve-bullet": `Improve the following resume bullet point to be more impactful and achievement-oriented.
    Make it measurable, use strong action verbs, and keep it concise.
    {{GOAL}}
    Return ONLY the improved bullet point. Do not add explanations.
    
    Original:`,
   
  "rewrite-summary": `Rewrite the following professional summary to be more compelling and ATS-friendly.
    Keep it 2-4 sentences. Focus on impact, skills, and career narrative.
    {{GOAL}}
    Return ONLY the rewritten summary. Do not add explanations.
    
    Original:`,
   
  "check-grammar": `Fix any grammar, spelling, or punctuation issues in the following text.
    Preserve the original meaning and style.
    {{GOAL}}
    Return ONLY the corrected text. Do not add explanations.
    
    Text:`,
   
  "suggest-achievements": `Suggest 3 measurable achievements for the following role description.
    Format as a numbered list with specific, quantifiable results.
    Never invent technologies or companies. Base suggestions on the context.
    {{GOAL}}
    
    Role:`,
   
  "generate-verbs": `Replace weak verbs in the following bullet points with stronger action verbs.
    Return the improved version.
    {{GOAL}}
    
    Text:`,

  "star-convert": `Rewrite the following bullet point using the STAR method (Situation, Task, Action, Result).
    Make it measurable and impactful. Use strong action verbs.
    If the original lacks context, infer realistic but honest details.
    {{GOAL}}
    Return ONLY the rewritten bullet point.
    
    Original:`,

  "parse-cv": `Extract resume data from the following text and return it as a valid JSON object. CRITICAL: Return ONLY the JSON, no markdown, no explanation.

    Structure your response exactly like this:
    {
      "name": "Full Name or null",
      "email": "email@example.com or null",
      "phone": "phone number or null",
      "location": "city, state or null",
      "summary": "2-3 sentence professional summary extracted from the resume, NOT including section headers or labels. Just the summary text itself or null",
      "skills": ["skill1", "skill2", ...] or empty array,
      "experience": [
        {
          "company": "Company Name",
          "position": "Job Title",
          "location": "Office location or null",
          "startDate": "YYYY-MM format or null",
          "endDate": "YYYY-MM format or 'Present' or null",
          "bullets": ["bullet1", "bullet2", ...],
          "technologies": ["tech1", "tech2", ...]
        }
      ] or empty array,
      "education": [
        {
          "institution": "University Name",
          "degree": "Bachelor/Master/etc",
          "field": "Field of Study",
          "location": "City, State or null",
          "startDate": "YYYY-MM or null",
          "endDate": "YYYY-MM or null",
          "gpa": "GPA or null",
          "honors": ["Honors if any", ...] or empty array
        }
      ] or empty array,
      "certifications": [
        { "name": "Cert Name", "issuer": "Issuer", "date": "YYYY", "url": "url or null" }
      ] or empty array,
      "projects": [
        { "name": "Project Name", "role": "Your role", "description": "Short description", "technologies": ["tech1"], "url": "url or null", "highlights": ["bullet1"] }
      ] or empty array,
      "languages": [
        { "language": "Language", "proficiency": "Native/Fluent/Conversational/Basic" }
      ] or empty array
    }

    IMPORTANT GUIDELINES:
    - Extract the professional summary as clean text WITHOUT section headers or formatting markers
    - Separate experience bullets from technical details (put tech in "technologies" field)
    - For dates, use YYYY-MM format (e.g., "2022-01" for January 2022). Use "Present" for current positions.
    - Extract skills as a flat list of individual skills (not comma-separated strings)
    - Remove any markdown, bullets, or formatting from extracted text
    - Return ONLY valid JSON. No markdown code blocks, no explanations, no additional text.

    Resume text:`,
};

export function validateAIResponse(_action: AIAction, response: string): string {
  return response.trim();
}

export function buildAIPrompt(action: AIAction, content: string, context?: string): string {
  let prompt = PROMPTS[action];

  let goalInstruction = "";
  if (context) {
    goalInstruction = GOAL_INSTRUCTIONS[context] ?? "";
  }

  prompt = prompt.replace("{{GOAL}}", goalInstruction);

  let fullPrompt = `${prompt}\n\n${content}`;
  if (context && !GOAL_INSTRUCTIONS[context]) {
    fullPrompt += `\n\nContext: ${context}`;
  }
  return fullPrompt;
}

export function generateFallbackResponse(action: AIAction, content: string): string {
  switch (action) {
    case "improve-bullet":
      return `Enhanced: ${content.replace(/^(worked|was|were|had|made|got|did)\s+/i, "")}`;
    case "rewrite-summary":
      return content;
    case "check-grammar":
      return content;
    case "suggest-achievements":
      return `1. Improved system performance through optimisation\n2. Led cross-functional team initiatives\n3. Reduced operational overhead`;
    case "star-convert":
      return `STAR Rewrite: ${content.replace(/^(worked|was|were|had|made|got|did)\s+/i, "Led ")}`;
    case "generate-verbs":
      return content.replace(/\b(worked|was|were|had|made)\b/gi, "Engineered");
    case "parse-cv": {
      const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);

      // ── Helpers ──────────────────────────────────────────────────────────
      const EMAIL_RE   = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i;
      const PHONE_RE   = /(\+?[\d][\d\s\-().]{6,}[\d])/;
      const URL_RE     = /(?:https?:\/\/)?(?:www\.)?(linkedin\.com\/in\/[\w-]+|github\.com\/[\w-]+)/i;
      const DATE_RE    = /(\d{4})[/-](\d{2})/;
      const YEAR_RE    = /\b(20\d{2}|19\d{2})\b/;
      const MONTH_MAP: Record<string, string> = {
        jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
        jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12",
      };

      function toYYYYMM(raw: string): string {
        raw = raw.trim();
        if (DATE_RE.test(raw)) return raw.replace(DATE_RE, "$1-$2");
        const mMatch = raw.match(/([a-z]{3})[a-z]*[\s,.-]+(\d{4})/i);
        if (mMatch) {
          const mon = MONTH_MAP[mMatch[1]!.toLowerCase().slice(0,3)] ?? "01";
          return `${mMatch[2]}-${mon}`;
        }
        const yMatch = raw.match(YEAR_RE);
        return yMatch ? `${yMatch[1]}-01` : "";
      }

      // ── Section splitting ─────────────────────────────────────────────────
      const SECTION_RE = /^(SUMMARY|PROFILE|OBJECTIVE|EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|TECHNICAL SKILLS|SKILLS\s*&\s*TECHNOLOGIES|CORE COMPETENCIES|PROJECTS|CERTIFICATIONS|LANGUAGES|AWARDS|PUBLICATIONS|VOLUNTEER|INTERESTS|REFERENCES)\s*:?\s*$/i;

      const sections: Record<string, string[]> = {};
      let currentSection = "HEADER";
      sections[currentSection] = [];

      for (const line of lines) {
        if (SECTION_RE.test(line)) {
          currentSection = line.replace(/:$/, "").trim().toUpperCase();
          sections[currentSection] = [];
        } else {
          if (!sections[currentSection]) sections[currentSection] = [];
          sections[currentSection]!.push(line);
        }
      }

      // ── Header parsing ────────────────────────────────────────────────────
      const headerText = (sections["HEADER"] ?? []).join(" ");
      const fullText   = content;

      const emailMatch = fullText.match(EMAIL_RE);
      const phoneMatch = fullText.match(PHONE_RE);
      const urlMatches = [...fullText.matchAll(new RegExp(URL_RE.source, "gi"))];

      const name  = lines[0] && !EMAIL_RE.test(lines[0]) && !PHONE_RE.test(lines[0]) ? lines[0] : "";
      const email = emailMatch?.[0] ?? "";
      const phone = phoneMatch?.[1] ?? "";

      // location: look for "City, ST" or "City, Country" pattern
      const locMatch = headerText.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2,}(?:\s+\d{5})?)/);
      const location = locMatch?.[1]?.trim() ?? "";

      let linkedin = "", github = "";
      for (const m of urlMatches) {
        if (m[0].includes("linkedin")) linkedin = m[0];
        else if (m[0].includes("github"))  github   = m[0];
      }

      // ── Summary ───────────────────────────────────────────────────────────
      const summaryLines = sections["SUMMARY"] ?? sections["PROFILE"] ?? sections["OBJECTIVE"] ?? [];
      const summary = summaryLines.join(" ").trim();

      // ── Skills ────────────────────────────────────────────────────────────
      const skillLines = sections["SKILLS"] ?? sections["TECHNICAL SKILLS"] ?? sections["SKILLS & TECHNOLOGIES"] ?? sections["CORE COMPETENCIES"] ?? [];
      const skillsRaw = skillLines.join(", ");
      const skills: string[] = skillsRaw
        .split(/[,|•·\n]+/)
        .map((s) => s.replace(/^[\w\s]+:/i, "").trim()) // strip "Languages: " labels
        .filter((s) => s.length > 1 && s.length < 40);

      // ── Experience ────────────────────────────────────────────────────────
      const expLines = sections["EXPERIENCE"] ?? sections["WORK EXPERIENCE"] ?? sections["PROFESSIONAL EXPERIENCE"] ?? sections["EMPLOYMENT"] ?? [];
      const experience: Record<string, unknown>[] = [];

      // Each job block starts with a line that has a company/title pattern
      // Heuristic: a line with 2+ capitalised words and no bullet prefix = header
      let currentJob: Record<string, unknown> | null = null;

      const BULLET_RE   = /^[•·\-–—*]\s*/;
      const DATE_RANGE  = /(\w[\w\s,.-]+?)\s*[-–—]\s*(present|\w[\w\s,.-]+)/i;

      for (const line of expLines) {
        const stripped = line.replace(BULLET_RE, "").trim();
        if (!stripped) continue;

        // Line that looks like a date range → attach to current job
        if (DATE_RANGE.test(line) && /\b(20|19)\d{2}\b/.test(line)) {
          const dm = line.match(DATE_RANGE);
          if (dm && currentJob) {
            currentJob.startDate = toYYYYMM(dm[1]!);
            currentJob.endDate   = dm[2]!.trim().toLowerCase() === "present"
              ? "Present"
              : toYYYYMM(dm[2]!);
          }
          continue;
        }

        // Bullet point → attach to current job
        if (BULLET_RE.test(line)) {
          if (currentJob) {
            (currentJob.bullets as string[]).push(stripped);
          }
          continue;
        }

        // "Company — Location" or "Title at Company" → new job
        if (/[—–|]|( at )/i.test(line) || (!currentJob && /^[A-Z]/.test(line))) {
          if (currentJob) experience.push(currentJob);
          // Try to split "Position — Company, Location" or "Position at Company"
          const atMatch  = line.match(/^(.+?)\s+at\s+(.+?)(?:,\s*(.+))?$/i);
          const dashMatch = line.match(/^(.+?)\s*[—–]\s*(.+?)(?:,\s*(.+))?$/);
          if (atMatch) {
            currentJob = { position: atMatch[1]!.trim(), company: atMatch[2]!.trim(), location: atMatch[3]?.trim() ?? "", startDate: "", endDate: "", bullets: [], technologies: [] };
          } else if (dashMatch) {
            currentJob = { position: dashMatch[1]!.trim(), company: dashMatch[2]!.trim(), location: dashMatch[3]?.trim() ?? "", startDate: "", endDate: "", bullets: [], technologies: [] };
          } else {
            currentJob = { position: "", company: stripped, location: "", startDate: "", endDate: "", bullets: [], technologies: [] };
          }
          continue;
        }

        // Otherwise treat as a bullet for current job
        if (currentJob) (currentJob.bullets as string[]).push(stripped);
      }
      if (currentJob) experience.push(currentJob);

      // ── Education ─────────────────────────────────────────────────────────
      const eduLines = sections["EDUCATION"] ?? [];
      const education: Record<string, unknown>[] = [];
      let currentEdu: Record<string, unknown> | null = null;

      for (const line of eduLines) {
        if (DATE_RANGE.test(line) && /\b(20|19)\d{2}\b/.test(line)) {
          const dm = line.match(DATE_RANGE);
          if (dm && currentEdu) {
            currentEdu.startDate = toYYYYMM(dm[1]!);
            currentEdu.endDate   = toYYYYMM(dm[2]!);
          }
          continue;
        }
        // GPA line
        if (/gpa/i.test(line)) {
          const gm = line.match(/[\d.]+/);
          if (currentEdu && gm) currentEdu.gpa = gm[0];
          continue;
        }
        if (/degree|bachelor|master|phd|doctor|associate|b\.s|m\.s|b\.a|m\.a/i.test(line)) {
          if (currentEdu) education.push(currentEdu);
          const degMatch = line.match(/^(.+?(?:bachelor|master|phd|doctor|associate|b\.s|m\.s|b\.a|m\.a)[^,]*)/i);
          const fieldMatch = line.match(/(?:of|in)\s+([^,]+)/i);
          currentEdu = {
            institution: "", degree: degMatch?.[1]?.trim() ?? line,
            field: fieldMatch?.[1]?.trim() ?? "",
            location: "", startDate: "", endDate: "", gpa: "", honors: [],
          };
        } else if (currentEdu && !currentEdu.institution) {
          currentEdu.institution = line;
        } else {
          if (currentEdu) education.push(currentEdu);
          currentEdu = { institution: line, degree: "", field: "", location: "", startDate: "", endDate: "", gpa: "", honors: [] };
        }
      }
      if (currentEdu) education.push(currentEdu);

      // ── Projects ──────────────────────────────────────────────────────────
      const projLines = sections["PROJECTS"] ?? [];
      const projects: Record<string, unknown>[] = [];
      let currentProj: Record<string, unknown> | null = null;
      for (const line of projLines) {
        if (BULLET_RE.test(line)) {
          if (currentProj) (currentProj.highlights as string[]).push(line.replace(BULLET_RE, "").trim());
        } else {
          if (currentProj) projects.push(currentProj);
          currentProj = { name: line, role: "", description: "", technologies: [], url: "", highlights: [] };
        }
      }
      if (currentProj) projects.push(currentProj);

      // ── Languages ─────────────────────────────────────────────────────────
      const langLines = sections["LANGUAGES"] ?? [];
      const languages = langLines
        .flatMap((l) => l.split(/[,;]/))
        .map((l) => {
          const m = l.match(/^([^(]+)\(([^)]+)\)/);
          return m
            ? { language: m[1]!.trim(), proficiency: m[2]!.trim() }
            : { language: l.trim(), proficiency: "" };
        })
        .filter((l) => l.language.length > 0);

      // ── Certifications ────────────────────────────────────────────────────
      const certLines = sections["CERTIFICATIONS"] ?? [];
      const certifications = certLines
        .filter((l) => !BULLET_RE.test(l) || true)
        .map((l) => ({ name: l.replace(BULLET_RE, "").trim(), issuer: "", date: "", url: "" }))
        .filter((c) => c.name.length > 0);

      return JSON.stringify({
        name, email, phone, location, linkedin, github, summary,
        skills, experience, education, projects, languages, certifications,
      });
    }
    default:
      return content;
  }
}
