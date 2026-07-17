"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useResumeStore } from "@/stores/resume-store";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  FolderGit2,
  Globe,
  GripVertical,
  CheckCircle2,
} from "lucide-react";

const sections = [
  { id: "personal",        label: "Personal Info",   icon: User },
  { id: "experience",      label: "Experience",       icon: Briefcase },
  { id: "education",       label: "Education",        icon: GraduationCap },
  { id: "skills",          label: "Skills",           icon: Wrench },
  { id: "certifications",  label: "Certifications",   icon: Award },
  { id: "projects",        label: "Projects",         icon: FolderGit2 },
  { id: "languages",       label: "Languages",        icon: Globe },
] as const;

export type SectionId = (typeof sections)[number]["id"];

/** Returns true if the section has enough data to be considered "complete". */
function useSectionCompletionMap(): Record<SectionId, boolean> {
  const data = useResumeStore((s) => s.data);
  return {
    personal:       !!(data.personal.name && data.personal.email),
    experience:     data.experience.length > 0,
    education:      data.education.length > 0,
    skills:         data.skills.length > 0,
    certifications: data.certifications.length > 0,
    projects:       data.projects.length > 0,
    languages:      data.languages.length > 0,
  };
}

export function SectionSidebar({
  activeSection,
  onSectionChange,
  sectionOrder,
  onReorder,
}: {
  activeSection: SectionId;
  onSectionChange: (id: SectionId) => void;
  sectionOrder: SectionId[];
  onReorder: (order: SectionId[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const completionMap = useSectionCompletionMap();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sections
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {sectionOrder.map((id, index) => {
            const section = sections.find((s) => s.id === id);
            if (!section) return null;
            const Icon = section.icon;
            const isActive    = activeSection === id;
            const isCompleted = completionMap[id];

            return (
              <div
                key={id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragIndex === null || dragIndex === index) return;
                  const newOrder = [...sectionOrder];
                  const [moved] = newOrder.splice(dragIndex, 1);
                  newOrder.splice(index, 0, moved!);
                  onReorder(newOrder);
                  setDragIndex(index);
                }}
                onDragEnd={() => setDragIndex(null)}
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`${section.label}${isCompleted ? " (completed)" : ""}`}
                onKeyDown={(e) => e.key === "Enter" && onSectionChange(id)}
                onClick={() => onSectionChange(id)}
                className={cn(
                  "group flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {/* Drag handle */}
                <GripVertical
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 transition-opacity",
                    isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40",
                  )}
                  aria-hidden="true"
                />

                {/* Section icon */}
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all",
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-accent",
                  )}
                  aria-hidden="true"
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                {/* Label */}
                <span className="flex-1 truncate">{section.label}</span>

                {/* Completion badge */}
                {isCompleted && (
                  <CheckCircle2
                    className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-all",
                      isActive ? "text-primary" : "text-green-500",
                    )}
                    aria-hidden="true"
                  />
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <div
                    className="absolute left-0 h-6 w-0.5 rounded-r-full bg-primary"
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer — completion count */}
      <div className="border-t px-4 py-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium tabular-nums">
            {Object.values(completionMap).filter(Boolean).length}/{sections.length}
          </span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700"
            style={{
              width: `${(Object.values(completionMap).filter(Boolean).length / sections.length) * 100}%`,
            }}
            role="progressbar"
            aria-valuenow={Object.values(completionMap).filter(Boolean).length}
            aria-valuemin={0}
            aria-valuemax={sections.length}
          />
        </div>
      </div>
    </div>
  );
}
