"use client";

import { FileText, Palette, ScrollText, Sparkles, GitBranch, Download } from "lucide-react";

export function BuilderPreview() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
        <div className="flex gap-1.5" aria-hidden="true">
          <div className="h-2.5 w-2.5 rounded-full text-[#EF4444]"><svg viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg></div>
          <div className="h-2.5 w-2.5 rounded-full text-[#EAB308]"><svg viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg></div>
          <div className="h-2.5 w-2.5 rounded-full text-[#22C55E]"><svg viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="currentColor"/></svg></div>
        </div>
        <div className="mx-auto flex-1 max-w-[200px] rounded-md bg-background/80 px-3 py-1 text-center text-[10px] text-muted-foreground/60 font-mono">
          careerforge.app/builder
        </div>
      </div>

      {/* Builder UI */}
      <div className="flex" style={{ minHeight: 280 }}>
        {/* Section sidebar */}
        <div className="w-28 shrink-0 border-r bg-muted/20 p-2 space-y-0.5">
          {[
            { label: "Personal Info", active: false },
            { label: "Experience", active: true },
            { label: "Education", active: false },
            { label: "Skills", active: false },
            { label: "Projects", active: false },
            { label: "Certifications", active: false },
          ].map((s) => (
            <div
              key={s.label}
              className={`rounded px-2 py-1 text-[10px] leading-tight ${
                s.active
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="flex-1 p-3 space-y-3 min-w-0">
          <div>
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Experience</div>
            <div className="rounded border bg-background p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <div className="h-2 w-24 rounded bg-muted-foreground/10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <div className="h-2 w-32 rounded bg-muted-foreground/10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <div className="h-2 w-20 rounded bg-muted-foreground/10" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-1">Education</div>
            <div className="rounded border bg-background p-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <div className="h-2 w-28 rounded bg-muted-foreground/10" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                <div className="h-2 w-16 rounded bg-muted-foreground/10" />
              </div>
            </div>
          </div>

          <div className="flex gap-1.5">
            <div className="h-5 rounded border bg-background px-2 flex items-center text-[9px] text-muted-foreground gap-1">
              <span className="text-primary font-medium">+</span> Add section
            </div>
          </div>
        </div>

        {/* Preview area */}
        <div className="hidden sm:block w-32 shrink-0 border-l bg-muted/10 p-2">
          <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/60 mb-2">Preview</div>
          <div className="space-y-1.5">
            <div className="h-2 w-16 rounded bg-foreground/10 mx-auto" />
            <div className="h-1 w-full rounded bg-muted-foreground/8" />
            <div className="h-1 w-4/5 rounded bg-muted-foreground/8" />
            <div className="h-1 w-full rounded bg-muted-foreground/8" />
            <div className="pt-2 space-y-1">
              <div className="h-1 w-3/4 rounded bg-muted-foreground/8" />
              <div className="h-1 w-full rounded bg-muted-foreground/8" />
              <div className="h-1 w-5/6 rounded bg-muted-foreground/8" />
            </div>
            <div className="pt-2 space-y-1">
              <div className="h-1 w-2/3 rounded bg-muted-foreground/8" />
              <div className="h-1 w-4/5 rounded bg-muted-foreground/8" />
              <div className="h-1 w-full rounded bg-muted-foreground/8" />
              <div className="h-1 w-3/4 rounded bg-muted-foreground/8" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-t bg-muted/30 px-3 py-1.5">
        {[FileText, Palette, ScrollText, Sparkles, GitBranch, Download].map((Icon, i) => (
          <div
            key={i}
            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] ${
              i === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/50"
            }`}
          >
            <Icon className="h-3 w-3" />
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <div className="h-1.5 w-16 rounded-full bg-muted-foreground/10 overflow-hidden">
            <div className="h-full w-[87%] rounded-full bg-primary/60" />
          </div>
          <span className="text-[10px] font-medium text-muted-foreground/60 font-mono">ATS 87</span>
        </div>
      </div>
    </div>
  );
}
