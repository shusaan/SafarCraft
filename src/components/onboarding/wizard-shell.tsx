"use client";

/**
 * Wizard stepper — shared between the 5 step components.
 *
 * Renders the current step's content + a progress bar + nav controls
 * (← / Skip / Save & next). Autosaves to localStorage so a refresh
 * restores the user to the same step with the same data.
 */
import { useCallback, useEffect, useState, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/engines/analytics";
import { cn } from "@/lib/utils";

export type WizardStepId = "personal" | "experience" | "education" | "extras" | "review";

export interface WizardStepDef {
  id: WizardStepId;
  label: string;
  title: string;
  description: string;
  /** Whether this step is required (Skip button disabled) or skippable. */
  required: boolean;
}

export const WIZARD_STEPS: WizardStepDef[] = [
  {
    id: "personal",
    label: "Personal",
    title: "Tell us about yourself",
    description: "Name, contact, and a one-line professional summary. Used at the top of your resume.",
    required: true,
  },
  {
    id: "experience",
    label: "Experience",
    title: "Add your work history",
    description: "One job per entry. Title, company, dates, bullets.",
    required: true,
  },
  {
    id: "education",
    label: "Education",
    title: "Where did you study?",
    description: "Degree, field, institution, dates. Optional GPA.",
    required: true,
  },
  {
    id: "extras",
    label: "Skills + Projects + Certs",
    title: "Skills, projects, certifications, languages",
    description: "Group your skills, list a couple of side projects, and any certifications you have. All optional — skip if blank.",
    required: false,
  },
  {
    id: "review",
    label: "Review & Export",
    title: "Pick a template and ship it",
    description: "Choose from 8 ATS-tested templates. You'll land in the builder where you can keep editing.",
    required: true,
  },
];

interface WizardShellProps {
  /** Slot for the current step's content. */
  children: (args: { step: WizardStepDef; index: number; total: number; goNext: () => void }) => ReactNode;
  /** Test-only override for the initial step. SSR + tests can set this to
   * skip the localStorage hydration path. */
  initialStep?: WizardStepId;
}

const STORAGE_KEY = "careerforge.wizard.state.v1";

interface StoredState {
  step: WizardStepId;
}

function loadStored(): StoredState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed && typeof parsed.step === "string") return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveStored(s: StoredState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* localStorage may be disabled — skip silently */
  }
}

function clearStored() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}

export function WizardShell({ children, initialStep }: WizardShellProps) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);

  // Hydrate from localStorage after first paint so we don't flash the
  // wrong step. If `initialStep` is provided (used in tests + SSR), prefer it.
  const initRef = useRef(false);
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const fromProps = initialStep;
    if (fromProps) {
      const idx = WIZARD_STEPS.findIndex((s) => s.id === fromProps);
      if (idx >= 0) setStepIndex(idx);
    } else {
      const stored = loadStored();
      if (stored) {
        const idx = WIZARD_STEPS.findIndex((s) => s.id === stored.step);
        if (idx > 0) setStepIndex(idx);
      }
    }
    trackEvent("wizard_step_viewed", { step: WIZARD_STEPS[stepIndex]?.id ?? "personal" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const step = WIZARD_STEPS[stepIndex]!;
  const total = WIZARD_STEPS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  const goNext = useCallback(() => {
    if (isLast) return;
    trackEvent("wizard_step_completed", { step: step.id });
    const next = stepIndex + 1;
    setStepIndex(next);
    saveStored({ step: WIZARD_STEPS[next]!.id });
    trackEvent("wizard_step_viewed", { step: WIZARD_STEPS[next]!.id });
  }, [isLast, step.id, stepIndex]);

  const goBack = useCallback(() => {
    if (isFirst) return;
    const prev = stepIndex - 1;
    setStepIndex(prev);
    saveStored({ step: WIZARD_STEPS[prev]!.id });
    trackEvent("wizard_step_viewed", { step: WIZARD_STEPS[prev]!.id });
  }, [isFirst, stepIndex]);

  const skip = useCallback(() => {
    if (step.required) return;
    trackEvent("wizard_step_skipped", { step: step.id });
    goNext();
  }, [step.required, step.id, goNext]);

  return (
    <div className="space-y-8">
      {/* Progress */}
      <div>
        <div className="mb-3 flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>
            Step {stepIndex + 1} of {total}
          </span>
          <Link
            href="/builder"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Skip wizard →
          </Link>
        </div>
        <ol className="grid gap-2 sm:grid-cols-5">
          {WIZARD_STEPS.map((s, i) => (
            <li
              key={s.id}
              aria-current={i === stepIndex ? "step" : undefined}
              className={cn(
                "rounded-md border px-3 py-2 text-xs font-medium",
                i === stepIndex
                  ? "border-primary bg-primary/10 text-primary"
                  : i < stepIndex
                    ? "border-success/30 bg-success/5 text-success"
                    : "border-border bg-muted/30 text-muted-foreground",
              )}
            >
              <div className="flex items-center gap-1.5">
                {i < stepIndex ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-current/10 text-[10px]">
                    {i + 1}
                  </span>
                )}
                <span>{s.label}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Step heading */}
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{step.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
      </header>

      {/* Step content (rendered by the parent wizard page) */}
      <section aria-live="polite">{children({ step, index: stepIndex, total, goNext })}</section>

      {/* Nav */}
      <div className="flex items-center justify-between border-t pt-6">
        <Button
          variant="ghost"
          onClick={goBack}
          disabled={isFirst}
          aria-label={isFirst ? "Back (disabled on first step)" : "Back"}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {!step.required && (
            <Button variant="ghost" onClick={skip}>
              Skip
            </Button>
          )}
          {!isLast && (
            <Button
              variant="gradient"
              onClick={goNext}
              aria-label="Save and continue to next step"
              className="gap-1.5"
            >
              Save &amp; next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {isLast && (
            <Button
              variant="gradient"
              size="lg"
              aria-label="Finish wizard and go to the builder"
              className="gap-1.5"
              onClick={() => {
                trackEvent("wizard_finished", {});
                clearStored();
                router.push("/builder?welcome=1&seed=wizard");
              }}
            >
              Build it
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper for the wizard entry page (server component).
 * The wizard entry reads the active step from localStorage on the client.
 * This server-rendered version returns the FIRST step by default so the
 * initial server payload is meaningful before the client hydrates.
 */
export function getDefaultWizardStep(): WizardStepDef {
  return WIZARD_STEPS[0]!;
}