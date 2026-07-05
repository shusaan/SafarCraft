import type { ResumeData } from "@/types";

type JSONResume = {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    url: string;
    summary: string;
    profiles: Array<{ network: string; url: string }>;
  };
  work: Array<{
    name: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    summary: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    area: string;
    studyType: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  skills: Array<{
    name: string;
    keywords: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    url: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    url: string;
    highlights: string[];
    roles: string[];
  }>;
  languages: Array<{
    language: string;
    fluency: string;
  }>;
};

export function exportJSONResume(data: ResumeData): Blob {
  const json: JSONResume = {
    basics: {
      name: data.personal.name,
      email: data.personal.email,
      phone: data.personal.phone,
      location: data.personal.location,
      url: data.personal.website,
      summary: data.personal.summary,
      profiles: [
        ...(data.personal.linkedin ? [{ network: "LinkedIn", url: data.personal.linkedin }] : []),
        ...(data.personal.github ? [{ network: "GitHub", url: data.personal.github }] : []),
      ],
    },
    work: data.experience.map((exp) => ({
      name: exp.company,
      position: exp.position,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.endDate,
      summary: "",
      highlights: exp.bullets.filter(Boolean),
    })),
    education: data.education.map((edu) => ({
      institution: edu.institution,
      area: edu.field,
      studyType: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate,
      gpa: edu.gpa,
    })),
    skills: data.skills.map((cat) => ({
      name: cat.category,
      keywords: cat.skills,
    })),
    certifications: data.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.date,
      url: cert.url,
    })),
    projects: data.projects.map((proj) => ({
      name: proj.name,
      description: proj.description,
      url: proj.url,
      highlights: proj.highlights.filter(Boolean),
      roles: proj.role ? [proj.role] : [],
    })),
    languages: data.languages.map((lang) => ({
      language: lang.language,
      fluency: lang.proficiency,
    })),
  };

  return new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
}
