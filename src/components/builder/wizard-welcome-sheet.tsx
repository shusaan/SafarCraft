"use client";

/**
 * WizardWelcomeSheet — shown on /builder?welcome=1&seed=wizard.
 *
 * A celebratory sheet that:
 *   - Confirms the user finished the wizard successfully.
 *   - Auto-dismisses after 6s.
 *   - Dismisses on click anywhere, ESC, or explicit "Let's edit" button.
 *   - Removes ?welcome=1 from the URL on dismiss so reloads don't re-show.
 *   - Fires 'welcome_sheet_seen' (mount) and 'welcome_sheet_dismissed'
 *     analytics events.
 *
 * Pure CSS sparkles (no external dependency).
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/engines/analytics";

export function WizardWelcomeSheet() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(true);
  const [firedSeen, setFiredSeen] = useState(false);

  const welcomeFlag = searchParams.get("welcome");
  const isWizardGrad = welcomeFlag === "1" && searchParams.get("seed") === "wizard";

  useEffect(() => {
    if (!isWizardGrad) return;
    if (!firedSeen) {
      trackEvent("welcome_sheet_seen", { source: "wizard" });
      setFiredSeen(true);
    }
    const t = setTimeout(() => dismiss("auto"), 6000);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss("escape");
    }
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWizardGrad]);

  function dismiss(reason: string) {
    trackEvent("welcome_sheet_dismissed", { source: "wizard", reason });
    setVisible(false);
    // Strip the welcome/seed params so refreshes don't re-trigger.
    const next = new URLSearchParams(searchParams.toString());
    next.delete("welcome");
    next.delete("seed");
    const qs = next.toString();
    router.replace(`${pathname}${qs ? "?" + qs : ""}`);
  }

  if (!isWizardGrad || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Welcome to the builder"
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-4 backdrop-blur-sm sm:items-center sm:justify-end sm:p-6"
      onClick={() => dismiss("click-outside")}
    >
      <div
        className="relative w-full max-w-md animate-in slide-in-from-bottom-4 fade-in rounded-2xl border bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Sparkles
          aria-hidden
          className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-2 text-white shadow-lg"
        />

        <p className="text-xs font-semibold uppercase tracking-wider text-primary">You're in.</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          Your resume is ready.
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          We filled in everything from the wizard. Pick a template, fine-tune any section, then export.
        </p>

        <div className="mt-5 flex items-center gap-2">
          <Button
            variant="gradient"
            size="lg"
            className="gap-1.5"
            onClick={() => dismiss("button")}
          >
            Let's edit
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => dismiss("dismiss")}>
            Dismiss
          </Button>
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground/70">
          Auto-closes in 6s · ESC or click outside also dismisses.
        </p>
      </div>
    </div>
  );
}