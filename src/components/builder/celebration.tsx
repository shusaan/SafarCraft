"use client";

import { useEffect, useState } from "react";
import { useResumeStore } from "@/stores/resume-store";

export function Celebration() {
  const [show, setShow] = useState(false);
  const data = useResumeStore((s) => s.data);

  useEffect(() => {
    const hasPersonal = data.personal.name;
    const hasExperience = data.experience.length > 0;
    const hasSkills = data.skills.length > 0;

    if (hasPersonal && hasExperience && hasSkills) {
      const celebrated = localStorage.getItem("careerforge-celebrated");
      if (!celebrated) {
        setShow(true);
        localStorage.setItem("careerforge-celebrated", "true");
        setTimeout(() => setShow(false), 3000);
      }
    }
  }, [data]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-bounce text-4xl" role="img" aria-label="Celebration">
        🎉
      </div>
      <div className="absolute bottom-8 rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-lg animate-pulse">
        Resume looking great!
      </div>
    </div>
  );
}
