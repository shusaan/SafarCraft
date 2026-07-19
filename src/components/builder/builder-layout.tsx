"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import { GoalSelector } from "./goal-selector";
import { BuilderStepper, type StepperStep } from "./builder-stepper";
import { WelcomeOverlay } from "./welcome-overlay";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { useAutosave } from "@/hooks/use-autosave";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { getSampleResume } from "@/lib/sample-resume";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  FileText, Undo2, Redo2, Eye, EyeOff, Palette, ScrollText,
  Sparkles, GitBranch, Download, Target, Globe, History, Sun, Moon,
  GitCompare, Menu, X, HelpCircle, Clock, Save,
} from "lucide-react";

type Panel = "editor" | "templates" | "ats" | "ai" | "github" | "export" | "jd" | "portfolio" | "compare";

const panelGroups = [
  {
    label: "Build",
    panels: [
      { id: "editor"    as Panel, label: "Editor",    icon: FileText  },
      { id: "templates" as Panel, label: "Templates", icon: Palette   },
    ],
  },
  {
    label: "Enhance",
    panels: [
      { id: "ats"    as Panel, label: "ATS",    icon: ScrollText },
      { id: "ai"     as Panel, label: "AI",     icon: Sparkles   },
      { id: "github" as Panel, label: "GitHub", icon: GitBranch     },
      { id: "jd"     as Panel, label: "JD",     icon: Target     },
    ],
  },
  {
    label: "Output",
    panels: [
      { id: "export"    as Panel, label: "Export",    icon: Download  },
      { id: "portfolio" as Panel, label: "Portfolio", icon: Globe     },
      { id: "compare"   as Panel, label: "Compare",   icon: GitCompare },
    ],
  },
];

const allPanels = panelGroups.flatMap((g) => g.panels);

const defaultOrder: SectionId[] = [
  "personal", "experience", "education", "skills",
  "certifications", "projects", "languages",
];

/* ── Autosave status indicator ── */
type SaveStatus = "saved" | "saving" | "unsaved";

function AutosavePill({ isDirty }: { isDirty: boolean }) {
  const [status, setStatus] = useState<SaveStatus>("saved");

  useEffect(() => {
    if (isDirty) {
      setStatus("unsaved");
    } else {
      setStatus("saving");
      const t = setTimeout(() => setStatus("saved"), 800);
      return () => clearTimeout(t);
    }
  }, [isDirty]);

  if (status === "saved") return null;

  return (
    <div
      className={cn(
        "hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-300",
        status === "saving"
          ? "bg-primary/10 text-primary"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      )}
      aria-live="polite"
      aria-label={status === "saving" ? "Saving…" : "Unsaved changes"}
    >
      {status === "saving" ? (
        <Save className="h-3 w-3 animate-pulse" aria-hidden="true" />
      ) : (
        <Clock className="h-3 w-3" aria-hidden="true" />
      )}
      {status === "saving" ? "Saving…" : "Unsaved"}
    </div>
  );
}

/* ── Panel wrapper with fade-in animation ── */
function PanelWrapper({ id, children }: { id: Panel; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    void el.offsetHeight;
    el.style.transition = "opacity 200ms ease, transform 200ms ease";
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
    return () => { el.style.transition = ""; };
  }, [id]);

  return (
    <div ref={ref} className="flex flex-1 flex-col overflow-hidden" aria-live="polite">
      {children}
    </div>
  );
}

export function BuilderLayout() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const panelParam   = searchParams.get("panel");

  const [activeSection,     setActiveSection]     = useState<SectionId>("personal");
  const [sectionOrder,      setSectionOrder]       = useState<SectionId[]>(defaultOrder);
  const [showPreview,       setShowPreview]        = useState(true);
  const [showResumeList,    setShowResumeList]     = useState(false);
  const [showVersionHistory,setShowVersionHistory] = useState(false);
  const [showShortcuts,     setShowShortcuts]      = useState(false);
  const [activePanel,       setActivePanel]        = useState<Panel>("editor");
  const [mobileMenuOpen,    setMobileMenuOpen]     = useState(false);
  const [previewWidth,      setPreviewWidth]       = useState(500);
  const [isResizing,        setIsResizing]         = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setShowPreview(!mq.matches);
  }, []);

  const isDirty    = useResumeStore((s) => s.isDirty);
  const undo       = useResumeStore((s) => s.undo);
  const redo       = useResumeStore((s) => s.redo);
  const data       = useResumeStore((s) => s.data);
  const updateData = useResumeStore((s) => s.updateData);
  const theme      = useUIStore((s) => s.theme);
  const setTheme   = useUIStore((s) => s.setTheme);

  useAutosave();
  useKeyboardShortcuts();

  // Load sample resume on first visit
  useEffect(() => {
    const hasData = data.personal.name || data.experience.length > 0;
    if (!hasData) updateData(getSampleResume());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMobileMenuOpen(false); menuButtonRef.current?.focus(); }
      if (e.key !== "Tab" || !mobileMenuRef.current) return;
      const focusable = mobileMenuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (panelParam && allPanels.some((p) => p.id === panelParam)) {
      setActivePanel(panelParam as Panel);
      router.replace("/builder", { scroll: false });
    }
  }, [panelParam, router]);

  const handleMouseDown = useCallback(() => setIsResizing(true), []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = window.innerWidth - e.clientX;
      setPreviewWidth(Math.max(300, Math.min(newWidth, window.innerWidth * 0.6)));
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);



  const handleStepperNavigate = (step: StepperStep) => {
    const stepToSection: Record<StepperStep, string> = {
      personal:   "personal",
      experience: "experience",
      "edu-skills": "education",
      extra:      "certifications",
      "ats-export": "ats",
    };
    const target = stepToSection[step];
    if (target === "ats" || target === "export") {
      setActivePanel(target);
    } else {
      setActiveSection(target as SectionId);
      setActivePanel("editor");
    }
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "editor":
        return (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-52 shrink-0 border-r max-md:hidden relative">
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
      case "templates":  return <TemplateSelector />;
      case "ats":        return <ATSPanel />;
      case "ai":         return <AIAssistant />;
      case "github":     return <GitHubImport />;
      case "export":     return <ExportPanel />;
      case "jd":         return <JDAnalyzer />;
      case "portfolio":  return <PortfolioGenerator />;
      case "compare":    return <VersionComparison />;
    }
  };

  return (
    <div className="flex h-screen flex-col">
      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between border-b bg-background/95 px-3 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/80"
        role="banner"
      >
        {/* Left — logo + nav */}
        <div className="flex items-center gap-2">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            ref={menuButtonRef}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Logo */}
          <button
            className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-accent"
            onClick={() => setShowResumeList(true)}
            aria-label="Manage resumes"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-500 shadow-sm" aria-hidden="true">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="hidden text-sm font-semibold sm:inline">CareerForge</span>
          </button>

          <div className="mx-2 h-4 w-px bg-border hidden sm:block" aria-hidden="true" />

          {/* Desktop panel navigation */}
          <nav
            className="hidden lg:flex items-center gap-0.5"
            role="navigation"
            aria-label="Builder panels"
          >
            {panelGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center">
                {gi > 0 && (
                  <div className="mx-1.5 h-4 w-px bg-border" aria-hidden="true" />
                )}
                <div className="flex items-center gap-0.5">
                  {group.panels.map(({ id, label, icon: Icon }) => {
                    const isActive = activePanel === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setActivePanel(id)}
                        aria-pressed={isActive}
                        aria-label={label}
                        className={cn(
                          "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:scale-105",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden xl:inline">{label}</span>
                        {isActive && (
                          <span
                            className="absolute bottom-0 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">
          <AutosavePill isDirty={isDirty} />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={undo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={redo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowVersionHistory(true)}
            title="Version History"
            aria-label="Version history"
          >
            <History className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard shortcuts"
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </Button>

          <div className="mx-1 h-4 w-px bg-border" aria-hidden="true" />

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
          >
            {theme === "dark"
              ? <Sun className="h-3.5 w-3.5" />
              : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle Preview"
            aria-label={showPreview ? "Hide preview" : "Show preview"}
            aria-pressed={showPreview}
          >
            {showPreview
              ? <EyeOff className="h-3.5 w-3.5" />
              : <Eye className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </header>

      {/* ── Goal Selector ── */}
      <GoalSelector />

      {/* ── Stepper ── */}
      <BuilderStepper
        activeSection={activeSection}
        activePanel={activePanel}
        onNavigate={handleStepperNavigate}
      />

      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        >
          <nav
            ref={mobileMenuRef}
            className="fixed left-0 top-0 h-full w-72 max-w-[85vw] bg-background p-4 shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold">CareerForge</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {panelGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.panels.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                        activePanel === id
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground",
                      )}
                      onClick={() => {
                        setActivePanel(id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* ── Main content ── */}
      <main className="flex flex-1 overflow-hidden" role="main" id="main-content">
        <div className="flex flex-1 flex-col overflow-hidden">
          <ErrorBoundary>
            <PanelWrapper key={activePanel} id={activePanel}>
              {renderPanel()}
            </PanelWrapper>
          </ErrorBoundary>
        </div>

        {/* ── Preview pane ── */}
        {showPreview && (
          <aside
            ref={previewRef}
            className="shrink-0 border-l relative flex flex-col max-md:fixed max-md:inset-0 max-md:z-30 max-md:bg-background"
            style={{ width: `${previewWidth}px` }}
            role="complementary"
            aria-label="Resume preview"
          >
            <div
              className={cn(
                "absolute left-0 top-0 h-full w-1 cursor-col-resize transition-colors max-md:hidden",
                isResizing ? "bg-primary/60" : "hover:bg-primary/30",
              )}
              onMouseDown={handleMouseDown}
              role="separator"
              aria-orientation="vertical"
              aria-label="Drag to resize preview"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft")  setPreviewWidth((w) => Math.max(300, w - 20));
                if (e.key === "ArrowRight") setPreviewWidth((w) => Math.min(window.innerWidth * 0.6, w + 20));
              }}
            />
            <ErrorBoundary>
              <ResumePreview />
            </ErrorBoundary>
          </aside>
        )}
      </main>

      {/* ── Overlays ── */}
      <OnboardingChecklist />
      <Celebration />
      <WelcomeOverlay />

      <Dialog open={showResumeList} onOpenChange={setShowResumeList}>
        <DialogContent>
          <DialogHeader><DialogTitle>My Resumes</DialogTitle></DialogHeader>
          <ResumeList onClose={() => setShowResumeList(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={showVersionHistory} onOpenChange={setShowVersionHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Version History</DialogTitle></DialogHeader>
          <VersionHistory />
        </DialogContent>
      </Dialog>

      <ShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
    </div>
  );
}
