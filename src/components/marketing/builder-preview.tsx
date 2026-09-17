"use client";

import { FileText, Palette, Sparkles, GitBranch, Download, Target, Zap } from "lucide-react";

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
        <div className="mx-auto flex-1 max-w-[220px] rounded-md bg-background/80 px-3 py-1 text-center text-[10px] text-muted-foreground/70 font-mono">
          careerforge.app/builder
        </div>
        <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          ATS 95
        </div>
      </div>

      {/* Builder UI */}
      <div className="grid grid-cols-[140px_1fr_180px] max-md:grid-cols-[1fr]">
        {/* Section sidebar */}
        <aside className="border-r bg-muted/10 p-3 max-md:hidden">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Sections
          </p>
          <ul className="space-y-1 text-[11px]">
            {[
              { label: "Personal Info", done: true },
              { label: "Experience", done: true },
              { label: "Education", done: true },
              { label: "Skills", done: true },
              { label: "Projects", done: false },
              { label: "Certifications", done: false },
            ].map((s) => (
              <li
                key={s.label}
                className={`flex items-center justify-between rounded-md px-2 py-1 ${
                  s.label === "Experience" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="truncate">{s.label}</span>
                {s.done && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      s.label === "Experience" ? "bg-primary-foreground" : "bg-green-500"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Editor area — shows real-looking content, not skeletons */}
        <div className="bg-background p-4">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700">
              A
            </span>
            <div>
              <p className="text-[11px] font-semibold text-foreground">Experience</p>
              <p className="text-[9px] text-muted-foreground">Work history in reverse-chronological order</p>
            </div>
          </div>

          <div className="rounded-md border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold text-foreground">
                  Senior Software Engineer — <span className="text-muted-foreground">Vercel</span>
                </p>
                <p className="mt-0.5 text-[9px] text-muted-foreground">Remote · 2021 – Present</p>
              </div>
              <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[9px] font-medium text-green-700">
                Current
              </span>
            </div>
            <ul className="mt-2 space-y-1.5 text-[10px] leading-relaxed text-foreground/90">
              <li className="flex gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Reduced p99 cold-start latency by <strong>45%</strong> by optimising the edge runtime.
              </li>
              <li className="flex gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Shipped the App Router used by <strong>1M+ developers</strong> within 3 months.
              </li>
              <li className="flex gap-1.5">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary" />
                Led migration from Pages Router to App Router across <strong>200+ internal apps</strong>.
              </li>
            </ul>
          </div>

          <div className="mt-2 flex items-center gap-1.5">
            <span className="rounded-md border bg-muted/30 px-2 py-0.5 text-[9px] text-muted-foreground">
              + Add bullet
            </span>
            <span className="rounded-md border border-dashed px-2 py-0.5 text-[9px] text-muted-foreground">
              Add experience
            </span>
          </div>
        </div>

        {/* Live preview */}
        <aside className="border-l bg-white p-3 text-[9px] text-zinc-800 max-md:hidden">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[8px] font-semibold uppercase tracking-wider text-zinc-400">
              Live preview
            </p>
            <span className="rounded bg-zinc-100 px-1 text-[8px] font-medium text-zinc-600">
              100%
            </span>
          </div>
          <p className="text-[12px] font-bold leading-tight text-zinc-900">Alex Johnson</p>
          <p className="mt-0.5 text-[8px] text-zinc-500">
            alex@example.com · San Francisco
          </p>
          <p className="mt-2 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
            Summary
          </p>
          <p className="mt-0.5 leading-snug text-zinc-700">
            Senior Software Engineer with 7 years of experience building scalable distributed systems.
          </p>
          <p className="mt-2 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
            Experience
          </p>
          <p className="mt-1 font-semibold text-zinc-900">
            Senior Software Engineer <span className="font-normal text-zinc-500">— Vercel</span>
          </p>
          <p className="text-[8px] italic text-zinc-500">Remote · 2021 – Present</p>
          <p className="mt-1 leading-snug text-zinc-700">
            • Reduced p99 cold-start latency by <strong>45%</strong> by optimising the edge runtime…
          </p>
          <p className="mt-2 text-[8px] font-semibold uppercase tracking-wider text-zinc-500">
            Skills
          </p>
          <p className="mt-1 leading-snug text-zinc-700">
            TypeScript · React · Node.js · PostgreSQL · AWS · Docker
          </p>
        </aside>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-t bg-muted/30 px-3 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FileText className="h-3.5 w-3.5" />
        </div>
        {[
          { Icon: Palette },
          { Icon: Target },
          { Icon: Zap },
          { Icon: GitBranch },
          { Icon: Download },
        ].map(({ Icon }, i) => (
          <div
            key={i}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/60"
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-500" />
          <span className="text-[10px] font-medium text-muted-foreground">
            <strong className="text-foreground">3</strong> quick-action suggestions
          </span>
        </div>
      </div>
    </div>
  );
}