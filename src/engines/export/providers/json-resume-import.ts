import type { ResumeData } from "@/types";
import { generateId } from "@/lib/utils";

type JRSchema = {
  $schema?: string;
  basics?: {
    name?: string;
    label?: string;
    email?: string;
    phone?: string;
    url?: string;
    location?: { address?: string; city?: string; region?: string };
    profiles?: Array<{ network?: string; username?: string; url?: string }>;
    summary?: string;
  };
  work?: Array<{
    name?: string;
    position?: string;
    location?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
    highlights?: string[];
    keywords?: string[];
  }>;
  education?: Array<{
    institution?: string;
    area?: string;
    studyType?: string;
    score?: string;
    startDate?: string;
    endDate?: string;
    courses?: string[];
  }>;
  skills?: Array<{ name?: string; level?: string; keywords?: string[] }>;
  projects?: Array<{
    name?: string;
    description?: string;
    highlights?: string[];
    keywords?: string[];
    url?: string;
    roles?: string[];
    startDate?: string;
    endDate?: string;
  }>;
  certificates?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  languages?: Array<{ language?: string; fluency?: string }>;
  publications?: Array<{
    name?: string;
    publisher?: string;
    releaseDate?: string;
    url?: string;
    summary?: string;
  }>;
  awards?: Array<{ title?: string; date?: string; awarder?: string; summary?: string }>;
};

function firstProfile(profiles: JRSchema["basics"] extends infer B ? (B extends { profiles?: Array<infer P> } ? P : never) : never) {
  return profiles ?? [];
}

function safeDate(d?: string): string {
  if (!d) return "";
  // JSON Resume uses YYYY-MM or YYYY-MM-DD; we accept both, but normalise to YYYY-MM if shorter
  return d.length >= 7 ? d.slice(0, 7) : d;
}

export interface ImportResult {
  data: ResumeData;
  warnings: string[];
}

export function importJSONResume(raw: string | object): ImportResult {
  let parsed: JRSchema;
  try {
    parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    throw new Error("Not valid JSON");
  }

  const warnings: string[] = [];
  const b = parsed.basics ?? {};
  const profiles = firstProfile((b as { profiles?: unknown[] }).profiles as never) ?? [];

  // Find best-matching URL by network
  let linkedin = "";
  let github = "";
  let website = "";
  for (const p of profiles as Array<{ network?: string; url?: string }>) {
    const net = (p.network ?? "").toLowerCase();
    const url = p.url ?? "";
    if (!url) continue;
    if (net.includes("linkedin") && !linkedin) linkedin = url;
    else if (net.includes("github") && !github) github = url;
    else if (!website) website = url;
  }
  if (b.url && !website) website = b.url;

  const location = b.location
    ? [b.location.city, b.location.region, b.location.address].filter(Boolean).join(", ")
    : "";

  const experience = (parsed.work ?? [])
    .filter((w) => w.name || w.position)
    .map((w) => ({
      id: generateId(),
      company: w.name ?? "",
      position: w.position ?? "",
      location: w.location ?? "",
      startDate: safeDate(w.startDate),
      endDate: safeDate(w.endDate),
      current: !w.endDate,
      bullets: (w.highlights ?? []).filter(Boolean),
      technologies: w.keywords ?? [],
    }));

  const education = (parsed.education ?? [])
    .filter((e) => e.institution)
    .map((e) => ({
      id: generateId(),
      institution: e.institution ?? "",
      degree: e.studyType ?? "",
      field: e.area ?? "",
      location: "",
      startDate: safeDate(e.startDate),
      endDate: safeDate(e.endDate),
      gpa: e.score ?? "",
      honors: [] as string[],
    }));

  // Skills: bucket by category. JSON Resume skills are flat with optional keywords (which we treat as the category).
  const skillsMap = new Map<string, string[]>();
  for (const s of parsed.skills ?? []) {
    const name = (s.name ?? "").trim();
    if (!name) continue;
    const categories = s.keywords ?? [];
    const cat = categories[0] ?? "Skills";
    if (!skillsMap.has(cat)) skillsMap.set(cat, []);
    skillsMap.get(cat)!.push(name);
  }
  const skills = Array.from(skillsMap.entries()).map(([category, sk]) => ({
    id: generateId(),
    category,
    skills: sk,
  }));

  const projects = (parsed.projects ?? [])
    .filter((p) => p.name)
    .map((p) => ({
      id: generateId(),
      name: p.name ?? "",
      role: p.roles?.[0] ?? "",
      description: p.description ?? "",
      technologies: p.keywords ?? [],
      url: p.url ?? "",
      highlights: (p.highlights ?? []).filter(Boolean),
    }));

  const certifications = (parsed.certificates ?? [])
    .filter((c) => c.name)
    .map((c) => ({
      id: generateId(),
      name: c.name ?? "",
      issuer: c.issuer ?? "",
      date: c.date ?? "",
      url: c.url ?? "",
    }));

  const languages = (parsed.languages ?? [])
    .filter((l) => l.language)
    .map((l) => ({
      id: generateId(),
      language: l.language ?? "",
      proficiency: l.fluency ?? "",
    }));

  const publications = (parsed.publications ?? [])
    .filter((p) => p.name)
    .map((p) => ({
      id: generateId(),
      title: p.name ?? "",
      publisher: p.publisher ?? "",
      date: p.releaseDate ?? "",
      url: p.url ?? "",
      description: p.summary ?? "",
    }));

  if (parsed.awards && parsed.awards.length) warnings.push(`${parsed.awards.length} award(s) not imported — CareerForge doesn't model awards yet`);

  const data: ResumeData = {
    personal: {
      name: b.name ?? "",
      email: b.email ?? "",
      phone: b.phone ?? "",
      location,
      linkedin,
      github,
      website,
      photo: null,
      summary: b.summary ?? "",
    },
    experience,
    education,
    skills,
    projects,
    certifications,
    languages,
    publications,
  };

  if (!b.name) warnings.push("No name in JSON Resume basics");
  if (experience.length === 0) warnings.push("No work experience found");
  if (skills.length === 0) warnings.push("No skills found");

  return { data, warnings };
}