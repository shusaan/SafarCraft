import { create } from "zustand";
import { persist } from "zustand/middleware";

type UIState = {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  previewMode: "edit" | "preview";
  visitorCount: number;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  setPreviewMode: (mode: "edit" | "preview") => void;
  setVisitorCount: (count: number) => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "system",
      previewMode: "edit",
      visitorCount: 0,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setPreviewMode: (mode) => set({ previewMode: mode }),
      setVisitorCount: (count) => set({ visitorCount: count }),
    }),
    {
      name: "careerforge-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    },
  ),
);
