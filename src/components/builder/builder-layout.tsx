"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/stores/resume-store";
import { useUIStore } from "@/stores/ui-store";
import { SectionSidebar, type SectionId } from "./section-sidebar";
import { SectionPanel } from "./section-panel";
import { ResumePreview } from "./resume-preview";
import { ResumeList } from "./resume-list";
import { TemplateSelector } from "@/components/template-selector/template-selector";
import { ATSPanel } from "@/components/ats/ats-panel";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { GitHubImport } from "@/components/github/github-import";
import { ExportPanel } from "@/components/export/export-panel";
import { JDAnalyzer } from "@/components/jd-analyzer/jd-analyzer";
import { PortfolioGenerator } from "@/components/portfolio/portfolio-generator";
import { VersionHistory } from "./version-history";
import { VersionComparison } from "./version-comparison";
import { OnboardingChecklist } from "./onboarding-checklist";
import { ShortcutsHelp } from "./shortcuts-help";
import { Celebration } from "./celebration";
import { useAutosave } from "@/hooks/use-autosave";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { getSampleResume } from "@/lib/sample-resume";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FileText, Undo2, Redo2, Eye, EyeOff, Palette, ScrollText,
  Sparkles, Github, Download, Target, Globe, History, Sun, Moon, GitCompare,
  Menu, X, HelpCircle,
} from "lucide-react";

type Panel = "editor" | "templates" | "ats" | "ai" | "github" | "export" | "jd" | "portfolio" | "compare";

const panelGroups = [
  {
    label: "Build",
    panels: [
      { id: "editor" as Panel, label: "Editor", icon: FileText },
      { id: "templates" as Panel, label: "Templates", icon: Palette },
    ],
  },
  {
    label: "Enhance",
    panels: [
      { id: "ats" as Panel, label: "ATS", icon: ScrollText },
      { id: "ai" as Panel, label: "AI", icon: Sparkles },
      { id: "github" as Panel, label: "GitHub", icon: Github },
      { id: "jd" as Panel, label: "JD", icon: Target },
    ],
  },
  {
    label: "Output",
    panels: [
      { id: "export" as Panel, label: "Export", icon: Download },
      { id: "portfolio" as Panel, label: "Portfolio", icon: Globe },
      { id: "compare" as Panel, label: "Compare", icon: GitCompare },
    ],
  },
];

const allPanels = panelGroups.flatMap((g) => g.panels);

const defaultOrder: SectionId[] = [
  "personal", "experience", "education", "skills",
  "certifications", "projects", "languages",
];

export function BuilderLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const panelParam = searchParams.get("panel");

  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(defaultOrder);
  const [showPreview, setShowPreview] = useState(true);
  const [showResumeList, setShowResumeList] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [activePanel, setActivePanel] = useState<Panel>("editor");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewWidth, setPreviewWidth] = useState(500);
  const [isResizing, setIsResizing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const isDirty = useResumeStore((s) => s.isDirty);
  const undo = useResumeStore((s) => s.undo);
  const redo = useResumeStore((s) => s.redo);
  const data = useResumeStore((s) => s.data);
  const updateData = useResumeStore((s) => s.updateData);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);

  useAutosave();
  useKeyboardShortcuts();

  // Load sample resume on first visit
  useEffect(() => {
    const hasData = data.personal.name || data.experience.length > 0;
    if (!hasData) {
      const sample = getSampleResume();
      updateData(sample);
    }
  }, []);

  useEffect(() => {
    if (panelParam && allPanels.some((p) => p.id === panelParam)) {
      setActivePanel(panelParam as Panel);
      router.replace("/builder", { scroll: false });
    }
  }, [panelParam, router]);

  // Resize handler
  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setPreviewWidth(Math.max(300, Math.min(newWidth, window.innerWidth * 0.6)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const renderPanel = () => {
    switch (activePanel) {
      case "editor":
        return (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-56 shrink-0 border-r lg:block hidden">
              <SectionSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                sectionOrder={sectionOrder}
                onReorder={setSectionOrder}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <SectionPanel section={activeSection} />
            </div>
          </div>
        );
      case "templates":
        return <TemplateSelector />;
      case "ats":
        return <ATSPanel />;
      case "ai":
        return <AIAssistant />;
      case "github":
        return <GitHubImport />;
      case "export":
        return <ExportPanel />;
      case "jd":
        return <JDAnalyzer />;
      case "portfolio":
        return <PortfolioGenerator />;
      case "compare":
        return <VersionComparison />;
    }
  };

  return (
    <div className="flex h-screen flex-col transition-colors duration-200">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b px-4 py-1.5" role="banner">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowResumeList(true)}
            aria-label="Manage resumes"
          >
            <FileText className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Resumes</span>
          </Button>
          <div className="mx-3 h-5 w-px bg-border hidden sm:block" />

          {/* Desktop toolbar - grouped */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main toolbar">
            {panelGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center">
                {gi > 0 && <div className="mx-1 h-4 w-px bg-border" />}
                <div className="flex items-center gap-0.5">
                  {group.panels.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={activePanel === id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setActivePanel(id)}
                      className="gap-1.5"
                      aria-pressed={activePanel === id}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">{label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          {isDirty && <span className="mr-2 text-xs text-amber-500 hidden sm:inline">Unsaved</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={undo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={redo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVersionHistory(true)}
            title="Version History"
            aria-label="Version history"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle Preview"
            aria-label="Toggle preview"
            aria-pressed={showPreview}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <nav
            className="fixed left-0 top-0 h-full w-64 bg-background p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Mobile menu"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {panelGroups.map((group) => (
              <div key={group.label} className="mb-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">{group.label}</p>
                <div className="space-y-1">
                  {group.panels.map(({ id, label, icon: Icon }) => (
                    <Button
                      key={id}
                      variant={activePanel === id ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        setActivePanel(id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex flex-1 overflow-hidden" role="main">
        <div className="flex flex-1 flex-col overflow-hidden">
          {renderPanel()}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <aside
            ref={previewRef}
            className="shrink-0 border-l relative"
            style={{ width: `${previewWidth}px` }}
            role="complementary"
            aria-label="Resume preview"
          >
            {/* Resize handle */}
            <div
              className="absolute left-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors"
              onMouseDown={handleMouseDown}
              role="separator"
              aria-label="Resize preview"
              tabIndex={0}
            />
            <div className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-sm font-medium">Preview</span>
            </div>
            <ResumePreview />
          </aside>
        )}
      </main>

      {/* Onboarding checklist */}
      <OnboardingChecklist />

      {/* Completion celebration */}
      <Celebration />

      {/* Resume list dialog */}
      <Dialog open={showResumeList} onOpenChange={setShowResumeList}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resumes</DialogTitle></DialogHeader>
          <ResumeList onClose={() => setShowResumeList(false)} />
        </DialogContent>
      </Dialog>

      {/* Version history dialog */}
      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Version History</DialogTitle></DialogHeader>
          <VersionHistory />
        </DialogContent>
      </Dialog>

      {/* Shortcuts help dialog */}
      <ShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}
