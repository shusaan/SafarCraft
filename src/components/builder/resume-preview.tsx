"use client";

import { useState, useEffect } from "react";
import { useResumeStore } from "@/stores/resume-store";
import { renderTemplate } from "@/engines/templates/registry";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Skeleton shimmer lines ── */
function PreviewSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-8" aria-label="Loading preview" aria-busy="true">
      {/* Header */}
      <div className="mx-auto mb-6 space-y-2 text-center">
        <div className="mx-auto h-5 w-48 rounded bg-muted" />
        <div className="mx-auto h-3 w-72 rounded bg-muted/70" />
      </div>
      {/* Section */}
      <div className="h-3 w-24 rounded bg-muted" />
      <div className="h-px w-full rounded bg-muted/50" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted/60" />
        <div className="h-3 w-5/6 rounded bg-muted/60" />
        <div className="h-3 w-4/5 rounded bg-muted/60" />
      </div>
      <div className="mt-4 h-3 w-24 rounded bg-muted" />
      <div className="h-px w-full rounded bg-muted/50" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-muted/60" />
        <div className="h-3 w-3/4 rounded bg-muted/60" />
      </div>
      <div className="mt-4 h-3 w-20 rounded bg-muted" />
      <div className="h-px w-full rounded bg-muted/50" />
      <div className="h-3 w-full rounded bg-muted/60" />
      <div className="h-3 w-5/6 rounded bg-muted/60" />
      <div className="h-3 w-2/3 rounded bg-muted/60" />
    </div>
  );
}

const ZOOM_STEPS = [50, 75, 100, 125, 150] as const;
type ZoomLevel = (typeof ZOOM_STEPS)[number];

export function ResumePreview() {
  const data     = useResumeStore((s) => s.data);
  const layout   = useResumeStore((s) => s.layout);
  const template = useResumeStore((s) => s.template);

  const [zoom, setZoom]     = useState<ZoomLevel>(100);
  const [ready, setReady]   = useState(false);

  // Tiny delay so skeleton shows on first mount / template swap
  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(t);
  }, [template]);

  const zoomIn  = () => setZoom((z) => (ZOOM_STEPS[ZOOM_STEPS.indexOf(z) + 1] ?? z));
  const zoomOut = () => setZoom((z) => (ZOOM_STEPS[ZOOM_STEPS.indexOf(z) - 1] ?? z));
  const resetZoom = () => setZoom(100);

  const canZoomIn  = zoom < ZOOM_STEPS[ZOOM_STEPS.length - 1]!;
  const canZoomOut = zoom > ZOOM_STEPS[0]!;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Preview toolbar */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-3 py-1.5">
        <span className="text-xs text-muted-foreground">
          Preview
        </span>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={zoomOut}
            disabled={!canZoomOut}
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={resetZoom}
            className="min-w-[3rem] rounded px-1.5 py-0.5 text-center text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label={`Current zoom: ${zoom}%. Click to reset.`}
            title="Reset zoom"
          >
            {zoom}%
          </button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={zoomIn}
            disabled={!canZoomIn}
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-1"
            onClick={resetZoom}
            aria-label="Reset zoom to 100%"
            title="Fit to window"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable canvas */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4">
        <div
          className={cn(
            "mx-auto origin-top bg-white shadow-lg dark:bg-neutral-950 transition-transform duration-300",
            "rounded-sm",
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
      </div>
    </div>
  );
}
