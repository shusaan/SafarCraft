"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  Award,
  FolderGit2,
  Globe,
  GripVertical,
} from "lucide-react";

const sections = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "certifications", label: "Certifications", icon: Award },
  { id: "projects", label: "Projects", icon: FolderGit2 },
  { id: "languages", label: "Languages", icon: Globe },
] as const;

export type SectionId = (typeof sections)[number]["id"];

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

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Sections</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sectionOrder.map((id, index) => {
            const section = sections.find((s) => s.id === id);
            if (!section) return null;
            const Icon = section.icon;
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
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  activeSection === id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50",
                )}
                onClick={() => onSectionChange(id)}
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <Icon className="h-4 w-4 shrink-0" />
                <span>{section.label}</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
