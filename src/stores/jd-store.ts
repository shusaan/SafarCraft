import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { JDParseResult } from "@/types";

/**
 * Stores the last job description the user analyzed and its result so the
 * ATS panel can surface real, job-specific missing keywords instead of a
 * generic hardcoded list. Persisted to localStorage so it survives reloads.
 */
type JDState = {
  jdText: string;
  result: JDParseResult | null;
  setAnalysis: (jdText: string, result: JDParseResult) => void;
  clear: () => void;
};

export const useJDStore = create<JDState>()(
  persist(
    (set) => ({
      jdText: "",
      result: null,
      setAnalysis: (jdText, result) => set({ jdText, result }),
      clear: () => set({ jdText: "", result: null }),
    }),
    { name: "careerforge-jd" },
  ),
);
