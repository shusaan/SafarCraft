"use client";

import { useResumeStore } from "@/stores/resume-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";


export type StepperStep = "personal" | "experience" | "edu-skills" | "extra" | "ats-export";

const steps: Array<{ id: StepperStep; label: string }> = [
  { id: "personal",   label: "Personal Info" },
  { id: "experience", label: "Experience" },
  { id: "edu-skills", label: "Education & Skills" },
  { id: "extra",      label: "Projects & More" },
  { id: "ats-export", label: "ATS & Export" },
];

// Map of which SectionId / Panel each step covers
const stepSections: Record<StepperStep, string[]> = {
  personal:   ["personal"],
  experience: ["experience"],
  "edu-skills": ["education", "skills"],
  extra:      ["certifications", "projects", "languages"],
  "ats-export": ["ats", "export"],
};

export function BuilderStepper({
  activeSection,
  activePanel,
  onNavigate,
}: {
  activeSection?: string;
  activePanel?: string;
  onNavigate: (step: StepperStep) => void;
}) {
  const data = useResumeStore((s) => s.data);

  const [completed, setCompleted] = useState<Set<StepperStep>>(new Set());

  useEffect(() => {
    const next = new Set<StepperStep>();
    if (data.personal.name) next.add("personal");
    if (data.experience.length > 0) next.add("experience");
    if ((data.education?.length ?? 0) > 0 || data.skills.some((c) => c.skills.length > 0)) next.add("edu-skills");
    if (
      (data.certifications?.length ?? 0) > 0 ||
      (data.projects?.length ?? 0) > 0 ||
      (data.languages?.length ?? 0) > 0
    ) next.add("extra");
    setCompleted(next);
  }, [data]);

  const currentSection = activePanel === "editor" ? activeSection : activePanel;

  const current: StepperStep = Object.entries(stepSections).find(
    ([, sections]) => sections.includes(currentSection ?? ""),
  )?.[0] as StepperStep ?? "personal";

  const totalSteps = steps.length;
  const completedCount = completed.size;
  const pct = Math.round((completedCount / totalSteps) * 100);

  return (
    <nav aria-label="Resume builder progress" className="border-b bg-background">
      <div className="flex items-center justify-center gap-2 px-4 py-2 max-w-4xl mx-auto">
        <ol className="flex items-center justify-center gap-0 flex-1">
        {steps.map((step, i) => {
          const isCompleted = completed.has(step.id);
          const isCurrent = current === step.id;

          return (
            <li key={step.id} className="flex items-center flex-1 min-w-0">
              <button
                onClick={() => onNavigate(step.id)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded px-1.5 py-1 min-w-0",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-muted-foreground/40 hover:text-muted-foreground/70",
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground/40",
                  )}
                  aria-hidden="true"
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                <span className="hidden sm:inline truncate">{step.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-px flex-1 transition-colors",
                    isCompleted ? "bg-primary/30" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
        </ol>
        <div
          className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`${pct}% complete`}
        >
          {pct}%
        </div>
      </div>
    </nav>
  );
}
