"use client";

import { useEffect, useRef } from "react";
import { PersonalInfoForm } from "./sections/personal-info-form";
import { ExperienceForm } from "./sections/experience-form";
import { EducationForm } from "./sections/education-form";
import { SkillsForm } from "./sections/skills-form";
import { CertificationsForm } from "./sections/certifications-form";
import { ProjectsForm } from "./sections/projects-form";
import { LanguagesForm } from "./sections/languages-form";
import type { SectionId } from "./section-sidebar";
import {
  User, Briefcase, GraduationCap, Wrench, Award, FolderGit2, Globe,
} from "lucide-react";

const sectionConfig: Record<
  SectionId,
  { label: string; subtitle: string; icon: React.ElementType; color: string }
> = {
  personal: {
    label: "Personal Information",
    subtitle: "Your name and contact info — this appears at the top of your resume",
    icon: User,
    color: "from-violet-500 to-indigo-500",
  },
  experience: {
    label: "Experience",
    subtitle: "Work history in reverse-chronological order",
    icon: Briefcase,
    color: "from-indigo-500 to-blue-500",
  },
  education: {
    label: "Education",
    subtitle: "Degrees, certifications, and academic achievements",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500",
  },
  skills: {
    label: "Skills",
    subtitle: "Technical and soft skills grouped by category",
    icon: Wrench,
    color: "from-cyan-500 to-teal-500",
  },
  certifications: {
    label: "Certifications",
    subtitle: "Professional certifications and licenses",
    icon: Award,
    color: "from-teal-500 to-green-500",
  },
  projects: {
    label: "Projects",
    subtitle: "Showcase your best work with links and technologies",
    icon: FolderGit2,
    color: "from-violet-500 to-purple-500",
  },
  languages: {
    label: "Languages",
    subtitle: "Languages you speak and your proficiency level",
    icon: Globe,
    color: "from-purple-500 to-pink-500",
  },
};

export function SectionPanel({ section }: { section: SectionId }) {
  const config = sectionConfig[section];
  const Icon = config.icon;

  // Animate in when section changes
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(8px)";
    // Force reflow
    void el.offsetHeight;
    el.style.transition = "opacity 220ms ease, transform 220ms ease";
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    return () => {
      el.style.transition = "";
    };
  }, [section]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto p-6">
      {/* Section header */}
      <div className="mb-6 flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} shadow-sm`}
          aria-hidden="true"
        >
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold leading-tight">{config.label}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{config.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      {section === "personal"       && <PersonalInfoForm />}
      {section === "experience"     && <ExperienceForm />}
      {section === "education"      && <EducationForm />}
      {section === "skills"         && <SkillsForm />}
      {section === "certifications" && <CertificationsForm />}
      {section === "projects"       && <ProjectsForm />}
      {section === "languages"      && <LanguagesForm />}
    </div>
  );
}
