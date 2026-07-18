"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { X } from "lucide-react";

const tips = [
  {
    title: "Fill in your details",
    body: "Start by adding your name, experience, and skills. The sidebar on the left lets you jump between sections.",
  },
  {
    title: "Analyse and optimise",
    body: "Use the ATS tool to score your resume against job descriptions. The AI assistant can improve your bullets.",
  },
  {
    title: "Export when ready",
    body: "Download your resume as PDF, DOCX, or Markdown. All exports are ATS-compliant.",
  },
];

export function WelcomeOverlay() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const hasCompletedOnboarding = useResumeStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useResumeStore((s) => s.completeOnboarding);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("careerforge-welcome-dismissed");
    if (!hasCompletedOnboarding && !dismissed) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [hasCompletedOnboarding]);

  if (!visible) return null;

  const current = tips[step];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/30" role="dialog" aria-modal="true" aria-label="Welcome guide">
      <div className="bg-background border rounded-lg shadow-xl p-5 max-w-sm w-full mx-4 mb-20 sm:mb-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-muted-foreground">
            Tip {step + 1} of {tips.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              sessionStorage.setItem("careerforge-welcome-dismissed", "true");
              setVisible(false);
            }}
            aria-label="Dismiss welcome guide"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <h3 className="text-sm font-semibold mb-1">{current.title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{current.body}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1.5">
            {tips.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-primary" : "bg-muted-foreground/20"}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {step < tips.length - 1 ? (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <Button size="sm" onClick={() => {
                completeOnboarding();
                sessionStorage.setItem("careerforge-welcome-dismissed", "true");
                setVisible(false);
              }}>
                Got it
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
