"use client";

import { useMemo } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepperStep = "personal" | "experience" | "edu-skills" | "extra" | "ats-export";

const steps: Array<{ id: StepperStep; label: string }> = [
  { id: "personal", label: "Personal Info" },
  { id: "experience", label: "Experience" },
  { id: "edu-skills", label: "Education & Skills" },
  { id: "extra", label: "Projects & More" },
  { id: "ats-export", label: "ATS & Export" },
];

const stepSections: Record<StepperStep, string[]> = {
  personal: ["personal"],
  experience: ["experience"],
  "edu-skills": ["education", "skills"],
  extra: ["certifications", "projects", "languages"],
  "ats-export": ["ats", "export"],
};

/** Data-backed steps. ATS & Export is an action step, not a completed section. */
const trackedSteps = steps.filter((step) => step.id !== "ats-export");

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

  const completed = useMemo(() => {
    const done = new Set<StepperStep>();
    if (data.personal.name.trim()) done.add("personal");
    if (data.experience.length > 0) done.add("experience");
    if ((data.education?.length ?? 0) > 0 || data.skills.some((category) => category.skills.length > 0)) {
      done.add("edu-skills");
    }
    if (
      (data.certifications?.length ?? 0) > 0 ||
      (data.projects?.length ?? 0) > 0 ||
      (data.languages?.length ?? 0) > 0
    ) {
      done.add("extra");
    }
    return done;
  }, [data]);

  const currentSection = activePanel === "editor" ? activeSection : activePanel;
  const currentEntry = Object.entries(stepSections).find(([, sections]) =>
    sections.includes(currentSection ?? ""),
  );
  const current = (currentEntry?.[0] as StepperStep | undefined) ?? null;

  const completedCount = trackedSteps.filter((step) => completed.has(step.id)).length;
  const pct = Math.round((completedCount / trackedSteps.length) * 100);
  const currentIndex = current ? steps.findIndex((step) => step.id === current) : -1;

  return (
    <nav aria-label="Resume builder progress" className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2.5">
        <ol className="flex min-w-0 flex-1 items-center">
          {steps.map((step, index) => {
            const isCompleted = completed.has(step.id);
            const isCurrent = current === step.id;
            const isLast = index === steps.length - 1;

            return (
              <li
                key={step.id}
                className={cn("flex min-w-0 items-center", !isLast && "flex-1")}
                data-step={step.id}
              >
                <button
                  type="button"
                  onClick={() => onNavigate(step.id)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${index + 1} ${step.label}${isCompleted ? " (complete)" : ""}${
                    isCurrent ? " (current step)" : ""
                  }`}
                  className={cn(
                    "group flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 text-xs font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isCurrent
                      ? "text-primary"
                      : isCompleted
                        ? "text-foreground hover:text-primary"
                        : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all",
                      isCurrent
                        ? "border-primary bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15"
                        : isCompleted
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground group-hover:border-muted-foreground/50",
                    )}
                    aria-hidden="true"
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>{" "}
                  <span className="hidden whitespace-nowrap md:inline">{step.label}</span>
                </button>

                {!isLast && (
                  <span
                    className={cn(
                      "mx-2 h-0.5 min-w-3 flex-1 rounded-full transition-colors",
                      isCompleted ? "bg-primary/70" : "bg-border",
                    )}
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div
          className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold tabular-nums text-primary"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={trackedSteps.length}
          aria-label={`${pct}% of resume sections complete${
            currentIndex >= 0 ? `; step ${currentIndex + 1} of ${steps.length}` : ""
          }`}
        >
          {pct}%
        </div>
      </div>
    </nav>
  );
}
