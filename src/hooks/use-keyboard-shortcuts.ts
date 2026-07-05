"use client";

import { useEffect } from "react";
import { useResumeStore } from "@/stores/resume-store";

export function useKeyboardShortcuts() {
  const undo = useResumeStore((s) => s.undo);
  const redo = useResumeStore((s) => s.redo);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);
}
