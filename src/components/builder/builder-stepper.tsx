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
      <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 px-4 py-2">
        <div className="relative flex flex-1 items-center">
          {/* Continuous progress track that fills behind the step chips */}
          <div
            className="absolute inset-x-3 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>

          <ol className="relative flex flex-1 items-center">
            {steps.map((step, i) => {
              const isCompleted = completed.has(step.id);
              const isCurrent = current === step.id;

              return (
                <li key={step.id} className="flex min-w-0 flex-1 items-center">
                  <button
                    onClick={() => onNavigate(step.id)}
                    className={cn(
                      "flex min-w-0 items-center gap-1.5 rounded px-1.5 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCompleted
                            ? "border-primary/40 bg-background text-primary"
                            : "border-border bg-background text-muted-foreground/40",
                      )}
                      aria-hidden="true"
                    >
                      {isCompleted ? <Check className="h-3 w-3" /> : i + 1}
                    </span>
                    <span className="hidden truncate sm:inline">{step.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className="mx-1 h-px flex-1" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div
          className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={totalSteps}
          aria-label={`${pct}% complete`}
        >
          {pct}%
        </div>
        <span className="hidden shrink-0 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-200 sm:inline">
          100% free
        </span>
      </div>
    </nav>
  );
}
