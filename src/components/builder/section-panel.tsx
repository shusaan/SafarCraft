"use client";

import { PersonalInfoForm } from "./sections/personal-info-form";
import { ExperienceForm } from "./sections/experience-form";
import { EducationForm } from "./sections/education-form";
import { SkillsForm } from "./sections/skills-form";
import { CertificationsForm } from "./sections/certifications-form";
import { ProjectsForm } from "./sections/projects-form";
import { LanguagesForm } from "./sections/languages-form";
import type { SectionId } from "./section-sidebar";

const sectionConfig: Record<SectionId, { label: string; subtitle: string }> = {
  personal: {
    label: "Personal Information",
    subtitle: "Start with your name and contact info — this appears at the top of your resume",
  },
  experience: {
    label: "Experience",
    subtitle: "Add your work history in reverse-chronological order",
  },
  education: {
    label: "Education",
    subtitle: "Add your degrees, certifications, and academic achievements",
  },
  skills: {
    label: "Skills",
    subtitle: "Highlight your technical and soft skills",
  },
  certifications: {
    label: "Certifications",
    subtitle: "Add professional certifications and licenses",
  },
  projects: {
    label: "Projects",
    subtitle: "Showcase your best work with links and technologies used",
  },
  languages: {
    label: "Languages",
    subtitle: "List languages and your proficiency level",
  },
};

export function SectionPanel({ section }: { section: SectionId }) {
  const config = sectionConfig[section];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{config.label}</h2>
        <p className="text-sm text-muted-foreground">{config.subtitle}</p>
      </div>
      {section === "personal" && <PersonalInfoForm />}
      {section === "experience" && <ExperienceForm />}
      {section === "education" && <EducationForm />}
      {section === "skills" && <SkillsForm />}
      {section === "certifications" && <CertificationsForm />}
      {section === "projects" && <ProjectsForm />}
      {section === "languages" && <LanguagesForm />}
    </div>
  );
}
