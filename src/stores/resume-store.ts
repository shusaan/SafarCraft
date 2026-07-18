import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResumeData, ResumeLayout } from "@/types";
export type ResumeGoal = "startup" | "faang" | "government" | "academia";
import { defaultResumeData, defaultResumeLayout } from "@/types";

type HistoryEntry = {
  data: ResumeData;
  timestamp: number;
};

type VersionEntry = {
  id: string;
  data: ResumeData;
  layout: ResumeLayout;
  template: string;
  timestamp: number;
  label: string;
};

type ResumeState = {
  resumes: Array<{ id: string; title: string; data: ResumeData }>;
  activeResumeId: string | null;
  data: ResumeData;
  layout: ResumeLayout;
  template: string;
  isDirty: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  versions: VersionEntry[];
  resumeGoal: ResumeGoal;
  hasCompletedOnboarding: boolean;

  setResumes: (resumes: Array<{ id: string; title: string; data: ResumeData }>) => void;
  setResumeGoal: (goal: ResumeGoal) => void;
  setActiveResume: (id: string) => void;
  updateData: (data: Partial<ResumeData>) => void;
  updatePersonal: (personal: Partial<ResumeData["personal"]>) => void;
  setLayout: (layout: Partial<ResumeLayout>) => void;
  setTemplate: (template: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  markSaved: () => void;
  saveVersion: (label?: string) => void;
  restoreVersion: (versionId: string) => void;
  completeOnboarding: () => void;
};

const MAX_HISTORY = 50;
const MAX_VERSIONS = 2;

const pushHistory = (state: ResumeState): Partial<ResumeState> => {
  const entry: HistoryEntry = { data: JSON.parse(JSON.stringify(state.data)), timestamp: Date.now() };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entry);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return { history: newHistory, historyIndex: newHistory.length - 1, isDirty: true };
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set, get) => ({
      resumes: [],
      activeResumeId: null,
      data: defaultResumeData,
      layout: defaultResumeLayout,
      template: "classic-ats",
      isDirty: false,
      history: [{ data: defaultResumeData, timestamp: Date.now() }],
      historyIndex: 0,
      versions: [],
      resumeGoal: "startup" as ResumeGoal,
      hasCompletedOnboarding: false,

      setResumes: (resumes) => set({ resumes }),
      setResumeGoal: (goal) => set({ resumeGoal: goal }),

      setActiveResume: (id) => {
        const resume = get().resumes.find((r) => r.id === id);
        if (resume) {
          set({ activeResumeId: id, data: resume.data, isDirty: false });
        }
      },

      updateData: (partial) => {
        set((state) => {
          const newData = { ...state.data, ...partial };
          return { data: newData, ...pushHistory({ ...state, data: newData }) };
        });
      },

      updatePersonal: (personal) => {
        set((state) => {
          const newData = { ...state.data, personal: { ...state.data.personal, ...personal } };
          return { data: newData, ...pushHistory({ ...state, data: newData }) };
        });
      },

      setLayout: (partial) =>
        set((state) => ({ layout: { ...state.layout, ...partial }, isDirty: true })),

      setTemplate: (template) => set({ template, isDirty: true }),

      undo: () => {
        const { historyIndex, history } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({ data: history[newIndex]!.data, historyIndex: newIndex, isDirty: true });
        }
      },

      redo: () => {
        const { historyIndex, history } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({ data: history[newIndex]!.data, historyIndex: newIndex, isDirty: true });
        }
      },

      reset: () =>
        set({
          data: defaultResumeData,
          layout: defaultResumeLayout,
          template: "classic-ats",
          history: [{ data: defaultResumeData, timestamp: Date.now() }],
          historyIndex: 0,
          isDirty: false,
        }),

      markSaved: () => set({ isDirty: false }),

      saveVersion: (label) => {
        const { data, layout, template, versions } = get();
        const newVersion: VersionEntry = {
          id: `v-${Date.now()}`,
          data: JSON.parse(JSON.stringify(data)),
          layout: { ...layout },
          template,
          timestamp: Date.now(),
          label: label ?? `Version ${versions.length + 1}`,
        };
        const newVersions = [...versions, newVersion].slice(-MAX_VERSIONS);
        set({ versions: newVersions });
      },

      restoreVersion: (versionId) => {
        const { versions } = get();
        const version = versions.find((v) => v.id === versionId);
        if (version) {
          set({
            data: version.data,
            layout: version.layout,
            template: version.template,
            isDirty: true,
          });
        }
      },

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    {
      name: "careerforge-resume",
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
        data: state.data,
        layout: state.layout,
        template: state.template,
        versions: state.versions,
        resumeGoal: state.resumeGoal,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
