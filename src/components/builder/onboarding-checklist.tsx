"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: "personal",
    number: "01",
    label: "Add your name and contact info",
    hint: "Personal Information section",
  },
  {
    id: "experience",
    number: "02",
    label: "Add at least one work experience",
    hint: "Experience section",
  },
  {
    id: "ats",
    number: "03",
    label: "Check your ATS score",
    hint: "ATS tab in the toolbar",
  },
];

export function OnboardingChecklist() {
  const [isOpen, setIsOpen]             = useState(true);
  const [isVisible, setIsVisible]       = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const hasCompletedOnboarding = useResumeStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding     = useResumeStore((s) => s.completeOnboarding);
  const data                   = useResumeStore((s) => s.data);

  // Slide in after 1.5 s on first mount
  useEffect(() => {
    if (hasCompletedOnboarding) return;
    const t = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(t);
  }, [hasCompletedOnboarding]);

  // Track completions
  useEffect(() => {
    if (hasCompletedOnboarding) { setIsOpen(false); return; }

    const timer = setTimeout(() => {
      const next = new Set<string>();
      if (data.personal.name) next.add("personal");
      if (data.experience.length > 0) next.add("experience");
      setCompletedSteps(next);
    }, 600);

    return () => clearTimeout(timer);
  }, [data, hasCompletedOnboarding]);

  // Auto-complete when all steps done
  useEffect(() => {
    if (completedSteps.size === steps.length) {
      const t = setTimeout(() => {
        completeOnboarding();
        setIsOpen(false);
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [completedSteps, completeOnboarding]);

  if (!isOpen || hasCompletedOnboarding) return null;

  const completedCount = completedSteps.size;
  const progress       = (completedCount / steps.length) * 100;
  const allDone        = completedCount === steps.length;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 transition-all duration-500",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0 pointer-events-none",
      )}
      role="region"
      aria-label="Onboarding checklist"
      aria-live="polite"
    >
      {/* Glass card */}
      <div className="bg-background/80 backdrop-blur-lg overflow-hidden rounded-2xl border shadow-2xl">
        {/* Gradient top strip */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" aria-hidden="true" />

        <div className="p-4">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500" aria-hidden="true">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-sm font-semibold">Quick Setup</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
              aria-label="Dismiss checklist"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{allDone ? "All done — ready to export!" : `${completedCount} of ${steps.length} complete`}</span>
            <span className="font-medium tabular-nums">{Math.round(progress)}%</span>
          </div>
          <div
            className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={completedCount}
            aria-valuemin={0}
            aria-valuemax={steps.length}
            aria-label={`${completedCount} of ${steps.length} steps complete`}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Steps */}
          <ol className="space-y-2.5">
            {steps.map((step) => {
              const isDone = completedSteps.has(step.id);
              return (
                <li key={step.id} className="flex items-start gap-3">
                  {/* Number / check circle */}
                  <div
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300",
                      isDone
                        ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white scale-110"
                        : "border-2 border-muted-foreground/30 text-muted-foreground",
                    )}
                    aria-hidden="true"
                  >
                    {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.number}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-xs font-medium transition-all duration-300",
                        isDone && "text-muted-foreground line-through",
                      )}
                    >
                      {step.label}
                    </p>
                    {!isDone && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">{step.hint}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Dismiss text */}
          {!allDone && (
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full text-center text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
