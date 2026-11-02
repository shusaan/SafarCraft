import type { ResumeData, ResumeLayout } from "@/types";
import type { TemplateId } from "@/engines/templates/registry";

/**
 * Sample resume used only for template thumbnails. Kept intentionally small so
 * every template shows its header, an experience block, and a sidebar/skills
 * block without overflowing the 816×1056 preview page.
 */
export const templatePreviewData: ResumeData = {
  personal: {
    name: "Ayesha Khan",
    email: "ayesha.khan@example.com",
    phone: "+92 300 1234567",
    location: "Karachi, Pakistan",
    linkedin: "linkedin.com/in/ayesha-khan",
    github: "github.com/ayeshakhan",
    website: "ayeshakhan.dev",
    photo: null,
    summary:
      "Frontend engineer with 6 years of experience building accessible, high-performance web applications for fintech and SaaS teams.",
  },
  experience: [
    {
      id: "preview-exp-1",
      company: "Careem",
      position: "Senior Frontend Engineer",
      location: "Dubai (Remote)",
      startDate: "2022",
      endDate: "",
      current: true,
      bullets: [
        "Led the migration of a legacy dashboard to Next.js, cutting page load time by 42%.",
        "Built a reusable design system used by 5 product teams and 40+ engineers.",
        "Mentored 4 engineers and introduced accessibility checks into the release process.",
      ],
      technologies: ["React", "Next.js", "TypeScript"],
    },
    {
      id: "preview-exp-2",
      company: "Systems Limited",
      position: "Frontend Engineer",
      location: "Lahore",
      startDate: "2020",
      endDate: "2022",
      current: false,
      bullets: [
        "Shipped a customer portal used by 120,000 monthly users.",
        "Reduced bundle size by 35% through code splitting and dependency cleanup.",
      ],
      technologies: ["React", "Redux", "Jest"],
    },
    {
      id: "preview-exp-3",
      company: "10Pearls",
      position: "Junior Web Developer",
      location: "Karachi",
      startDate: "2018",
      endDate: "2020",
      current: false,
      bullets: [
        "Delivered responsive marketing sites for 8 clients across 3 industries.",
        "Automated visual regression checks, catching 20+ UI defects per quarter.",
      ],
      technologies: ["JavaScript", "HTML", "CSS"],
    },
  ],
  education: [
    {
      id: "preview-edu-1",
      institution: "National University of Sciences and Technology",
      degree: "BS",
      field: "Computer Science",
      location: "Islamabad",
      startDate: "2014",
      endDate: "2018",
      gpa: "3.7/4.0",
      honors: ["Dean's List"],
    },
  ],
  skills: [
    { id: "preview-skill-1", category: "Frontend", skills: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { id: "preview-skill-2", category: "Testing", skills: ["Vitest", "Playwright", "Jest"] },
    { id: "preview-skill-3", category: "Tools", skills: ["Git", "Figma", "Docker", "CI/CD"] },
  ],
  certifications: [
    {
      id: "preview-cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2023",
      url: "",
    },
    {
      id: "preview-cert-2",
      name: "Meta Front-End Developer",
      issuer: "Meta",
      date: "2021",
      url: "",
    },
  ],
  projects: [
    {
      id: "preview-project-1",
      name: "Accessible Design System",
      role: "Creator",
      description: "Open-source component library with WCAG 2.2 AA coverage.",
      technologies: ["React", "TypeScript"],
      url: "",
      highlights: ["Adopted by 3 internal teams", "98% accessibility score"],
    },
    {
      id: "preview-project-2",
      name: "CV Parser",
      role: "Contributor",
      description: "Local-first resume parser for PDF and DOCX files.",
      technologies: ["TypeScript", "pdfjs"],
      url: "",
      highlights: ["Processes files entirely in the browser"],
    },
  ],
  languages: [
    { id: "preview-lang-1", language: "English", proficiency: "Professional" },
    { id: "preview-lang-2", language: "Urdu", proficiency: "Native" },
  ],
  publications: [],
};

/**
 * A readable layout for every template. Two-column templates get the two-column
 * layout so the thumbnail reflects their actual sidebar structure.
 */
export const templatePreviewLayouts: Record<TemplateId, ResumeLayout> = {
  "classic-ats": {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#1a56db",
    fontSize: "medium",
    spacing: "normal",
  },
  "modern-professional": {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#0f766e",
    fontSize: "medium",
    spacing: "normal",
  },
  executive: {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#1e3a5f",
    fontSize: "medium",
    spacing: "normal",
  },
  pikachu: {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#f59e0b",
    fontSize: "medium",
    spacing: "normal",
  },
  onyx: {
    columns: "two",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#1f2937",
    fontSize: "medium",
    spacing: "normal",
  },
  leafish: {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#16a34a",
    fontSize: "medium",
    spacing: "normal",
  },
  bronzor: {
    columns: "two",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#0f766e",
    fontSize: "medium",
    spacing: "normal",
  },
  gengar: {
    columns: "one",
    showPicture: false,
    picturePosition: "left",
    primaryColor: "#8b5cf6",
    fontSize: "medium",
    spacing: "normal",
  },
};
