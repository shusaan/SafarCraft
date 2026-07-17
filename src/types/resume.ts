export type ResumeData = {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
    website: string;
    photo: string | null;
    summary: string;
  };
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: SkillCategory[];
  certifications: CertificationEntry[];
  projects: ProjectEntry[];
  languages: LanguageEntry[];
  publications: PublicationEntry[];
};

export type ExperienceEntry = {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
  technologies: string[];
};

export type EducationEntry = {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  honors: string[];
};

export type SkillCategory = {
  id: string;
  category: string;
  skills: string[];
};

export type CertificationEntry = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
};

export type ProjectEntry = {
  id: string;
  name: string;
  role: string;
  description: string;
  technologies: string[];
  url: string;
  highlights: string[];
};

export type LanguageEntry = {
  id: string;
  language: string;
  proficiency: string;
};

export type PublicationEntry = {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
  description: string;
};

export type ResumeLayout = {
  columns: "one" | "two";
  showPicture: boolean;
  picturePosition: "left" | "right" | "top";
  primaryColor: string;
  fontSize: "small" | "medium" | "large";
  spacing: "compact" | "normal" | "relaxed";
};

export const defaultResumeData: ResumeData = {
  personal: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
    photo: null,
    summary: "",
  },
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  languages: [],
  publications: [],
};

export const defaultResumeLayout: ResumeLayout = {
  columns: "one",
  showPicture: false,
  picturePosition: "left",
  primaryColor: "#1a56db",
  fontSize: "medium",
  spacing: "normal",
};
