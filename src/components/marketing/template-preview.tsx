"use client";

import { useEffect, useRef, useState } from "react";
import { renderTemplate, type TemplateId } from "@/engines/templates/registry";
import { templatePreviewData, templatePreviewLayouts } from "@/data/template-preview";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;

/**
 * Renders the actual template component at its real 816×1056 page size, then
 * scales it down to the available width. This keeps marketing previews faithful
 * to the builder instead of hand-drawn placeholder blocks.
 */
export function TemplatePreview({
  id,
  compact = false,
  className,
}: {
  id: TemplateId;
  compact?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.28);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / PAGE_WIDTH);
    };

    update();
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const layout = templatePreviewLayouts[id];

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-template-preview={id}
      className={cn(
        "resume-light pointer-events-none relative w-full select-none overflow-hidden rounded-lg border bg-white shadow-sm",
        compact ? "h-24" : "aspect-[816/1056]",
        className,
      )}
    >
      <div
        className="absolute left-0 top-0 origin-top-left bg-white"
        style={{
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="p-8">{renderTemplate(id, { data: templatePreviewData, layout })}</div>
      </div>
    </div>
  );
}
