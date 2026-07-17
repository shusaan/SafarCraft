import type { ResumeData, ResumeLayout } from "@/types";
import type { ReactNode } from "react";

export interface TemplateProps {
  data: ResumeData;
  layout: ResumeLayout;
}

export function SectionTitle({ color, children }: { color: string; children: ReactNode }) {
  return (
    <div className="mb-1.5">
      <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
        {children}
      </span>
      <div className="mt-0.5 h-px" style={{ backgroundColor: color, opacity: 0.3 }} />
    </div>
  );
}

export function ContactLine({ label: _label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <span className="text-xs text-muted-foreground">
      {value}
    </span>
  );
}

export function DateRange({ start, end, current }: { start: string; end: string; current?: boolean }) {
  return (
    <span className="shrink-0 text-xs text-muted-foreground">
      {start} – {current ? "Present" : end}
    </span>
  );
}
