import type { ResumeData } from "@/types";

export function exportJSONResume(data: ResumeData): Blob {
  const out = {
    $schema: "https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
    basics: {
      name: data.personal.name,
      label: data.personal.summary?.split(".")[0] ?? "",
      email: data.personal.email,
      phone: data.personal.phone,
      location: data.personal.location
        ? { address: data.personal.location, city: data.personal.location }
        : undefined,
      profiles: [
        data.personal.linkedin && { network: "LinkedIn", url: data.personal.linkedin },
        data.personal.github && { network: "GitHub", url: data.personal.github },
        data.personal.website && { network: "Website", url: data.personal.website },
      ].filter(Boolean),
      summary: data.personal.summary,
    },
    work: data.experience
      .filter((e) => e.company || e.position)
      .map((e) => ({
        name: e.company,
        position: e.position,
        location: e.location,
        startDate: e.startDate,
        endDate: e.current ? undefined : e.endDate || undefined,
        highlights: e.bullets.filter(Boolean),
        keywords: e.technologies,
      })),
    education: data.education
      .filter((e) => e.institution)
      .map((e) => ({
        institution: e.institution,
        area: e.field,
        studyType: e.degree,
        startDate: e.startDate,
        endDate: e.endDate,
        score: e.gpa,
      })),
    skills: data.skills.flatMap((c) =>
      c.skills.map((skill) => ({ name: skill, level: undefined, keywords: [c.category] })),
    ),
    projects: data.projects
      .filter((p) => p.name)
      .map((p) => ({
        name: p.name,
        description: p.description,
        highlights: p.highlights?.filter(Boolean) ?? [],
        keywords: p.technologies,
        url: p.url,
        roles: p.role ? [p.role] : undefined,
      })),
    certificates: data.certifications
      .filter((c) => c.name)
      .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date, url: c.url })),
    languages: data.languages
      .filter((l) => l.language)
      .map((l) => ({ language: l.language, fluency: l.proficiency })),
    publications: data.publications
      ?.filter((p) => p.title)
      .map((p) => ({
        name: p.title,
        publisher: p.publisher,
        releaseDate: p.date,
        url: p.url,
        summary: p.description,
      })),
  };

  return new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
}
