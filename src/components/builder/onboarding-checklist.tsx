"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Circle, X } from "lucide-react";

const steps = [
  { id: "personal", label: "Add your name and contact info", section: "personal" },
  { id: "experience", label: "Add your work experience", section: "experience" },
  { id: "ats", label: "Check your ATS score", section: "ats" },
];

export function OnboardingChecklist() {
  const [isOpen, setIsOpen] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const hasCompletedOnboarding = useResumeStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useResumeStore((s) => s.completeOnboarding);
  const data = useResumeStore((s) => s.data);

  useEffect(() => {
    if (hasCompletedOnboarding) {
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      const newCompleted = new Set<string>();
      if (data.personal.name) newCompleted.add("personal");
      if (data.experience.length > 0) newCompleted.add("experience");
      setCompletedSteps(newCompleted);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data, hasCompletedOnboarding]);

  useEffect(() => {
    if (completedSteps.size === steps.length) {
      const timer = setTimeout(() => {
        completeOnboarding();
        setIsOpen(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [completedSteps, completeOnboarding]);

  if (!isOpen || hasCompletedOnboarding) return null;

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Quick Setup</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mb-3 text-xs text-muted-foreground">
          {completedSteps.size === steps.length
            ? "All done! You're ready to export."
            : `${completedSteps.size}/${steps.length} complete — ~2 min`}
        </p>

        <div className="space-y-2">
          {steps.map((step) => {
            const isCompleted = completedSteps.has(step.id);
            return (
              <div key={step.id} className="flex items-center gap-2">
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span
                  className={`text-xs ${
                    isCompleted ? "text-muted-foreground line-through" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
