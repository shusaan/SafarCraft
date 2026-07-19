"use client";

import { useState, useEffect, useMemo } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { renderTemplate } from "@/engines/templates/registry";
import type { ResumeData } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ZoomIn, ZoomOut, Maximize2, Eye, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function PreviewSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-8" aria-label="Loading preview" aria-busy="true">
      <div className="mx-auto mb-6 space-y-2 text-center">
        <div className="mx-auto h-5 w-48 rounded bg-muted" />
        <div className="mx-auto h-3 w-72 rounded bg-muted/70" />
      </div>
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="h-px w-full rounded bg-muted/50" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted/60" />
        <div className="h-3 w-5/6 rounded bg-muted/60" />
        <div className="h-3 w-4/5 rounded bg-muted/60" />
      </div>
    </div>
  );
}

const ZOOM_STEPS = [50, 75, 100, 125, 150] as const;
type ZoomLevel = (typeof ZOOM_STEPS)[number];

function generateRawText(data: ResumeData): string {
  const lines: string[] = [];
  if (data.personal.name) lines.push(data.personal.name);
  if (data.personal.email || data.personal.phone) {
    lines.push([data.personal.email, data.personal.phone].filter(Boolean).join(" · "));
  }
  lines.push("");
  if (data.personal.summary) {
    lines.push("Summary", data.personal.summary, "");
  }
  for (const exp of data.experience) {
    lines.push(`${exp.position} at ${exp.company}`);
    if (exp.startDate || exp.endDate) lines.push(`${exp.startDate} — ${exp.endDate || "Present"}`);
    for (const bullet of exp.bullets.filter(Boolean)) {
      lines.push(`  · ${bullet}`);
    }
    lines.push("");
  }
  for (const edu of data.education) {
    lines.push(`${edu.degree} — ${edu.institution}`);
    lines.push("");
  }
  return lines.join("\n");
}

export function ResumePreview() {
  const data     = useResumeStore((s) => s.data);
  const layout   = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);

  const [zoom, setZoom]     = useState<ZoomLevel>(100);
  const [ready, setReady]   = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, [template]);

  const rawText = useMemo(() => generateRawText(data), [data]);

  const zoomIn  = () => setZoom((z) => (ZOOM_STEPS[ZOOM_STEPS.indexOf(z) + 1] ?? z));
  const zoomOut = () => setZoom((z) => (ZOOM_STEPS[ZOOM_STEPS.indexOf(z) - 1] ?? z));
  const resetZoom = () => setZoom(100);

  const canZoomIn  = zoom < ZOOM_STEPS[ZOOM_STEPS.length - 1]!;
  const canZoomOut = zoom > ZOOM_STEPS[0]!;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
        <div className="flex items-center gap-1">
          <Button
            variant={viewMode === "preview" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setViewMode("preview")}
            aria-label="Preview mode"
            aria-pressed={viewMode === "preview"}
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
          <Button
            variant={viewMode === "raw" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs px-2"
            onClick={() => setViewMode("raw")}
            aria-label="Raw text mode"
            aria-pressed={viewMode === "raw"}
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Raw
          </Button>
        </div>

        {viewMode === "preview" && (
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={!canZoomOut} aria-label="Zoom out">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <button
              onClick={resetZoom}
              className="min-w-[3rem] rounded px-1.5 py-0.5 text-center text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label={`Current zoom: ${zoom}%. Click to reset.`}
            >
              {zoom}%
            </button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} disabled={!canZoomIn} aria-label="Zoom in">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 ml-1" onClick={resetZoom} aria-label="Reset zoom to 100%">
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4">
        {viewMode === "preview" ? (
          <div
            className={cn(
              "mx-auto origin-top bg-white shadow-lg dark:bg-neutral-950 transition-transform duration-300 rounded-sm",
            )}
            style={{
              width: "816px",
              minHeight: "1056px",
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              marginBottom: zoom < 100 ? `${-1056 * (1 - zoom / 100)}px` : undefined,
            }}
            aria-label="Resume document"
          >
            {ready ? (
              <div className="p-8 transition-opacity duration-300">
                {renderTemplate(template, { data, layout })}
              </div>
            ) : (
              <PreviewSkeleton />
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-2">
            <Textarea
              readOnly
              rows={20}
              value={rawText}
              className="min-h-[500px] font-mono text-sm leading-relaxed"
              aria-label="Raw resume text"
            />
            <p className="text-right text-xs text-muted-foreground" aria-live="polite">
              {rawText.length} characters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
