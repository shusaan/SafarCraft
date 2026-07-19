"use client";

import { useEffect, useCallback } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { useToast } from "@/components/ui/toast";

let toastNotified = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function useAutosave() {
  const data = useResumeStore((s) => s.data);
  const layout = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);
  const isDirty = useResumeStore((s) => s.isDirty);
  const markSaved = useResumeStore((s) => s.markSaved);
  const { toast } = useToast();

  useEffect(() => {
    if (!isDirty) return;

    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {
      try {
        const existing = localStorage.getItem("careerforge-autosave");
        const parsed = existing ? JSON.parse(existing) : null;

        if (parsed?.id) {
          const res = await fetch(`/api/resumes/${parsed.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, template, layout }),
          });
          if (res.status === 501) return;
        } else {
          const res = await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data, template, layout }),
          });
          if (res.status === 501) return;
          if (res.ok) {
            const created = await res.json();
            localStorage.setItem("careerforge-autosave", JSON.stringify({ id: created.id }));
          }
        }
        markSaved();
        if (!toastNotified) {
          toastNotified = true;
          toast({ title: "Draft auto-saved locally", variant: "success" });
          setTimeout(() => { toastNotified = false; }, 5000);
        }
      } catch {
        // Silently fail — local persistence works without API
      }
    }, 2000);

    return () => {
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, [data, isDirty, layout, template, markSaved, toast]);
}
