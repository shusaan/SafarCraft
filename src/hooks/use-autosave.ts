"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { debounce } from "@/lib/utils";

export function useAutosave() {
  const data = useResumeStore((s) => s.data);
  const layout = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);
  const isDirty = useResumeStore((s) => s.isDirty);
  const markSaved = useResumeStore((s) => s.markSaved);

  const save = debounce(async (resumeData: typeof data) => {
    try {
      const existing = localStorage.getItem("careerforge-autosave");
      const parsed = existing ? JSON.parse(existing) : null;

      if (parsed?.id) {
        const res = await fetch(`/api/resumes/${parsed.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: resumeData, template, layout }),
        });
        if (res.status === 501) return;
      } else {
        const res = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: resumeData, template, layout }),
        });
        if (res.status === 501) return;
        if (res.ok) {
          const created = await res.json();
          localStorage.setItem("careerforge-autosave", JSON.stringify({ id: created.id }));
        }
      }
      markSaved();
    } catch {
      // Silently fail — local persistence works without API
    }
  }, 2000);

  useEffect(() => {
    if (isDirty) {
      save(data);
    }
  }, [data, isDirty, save]);
}
