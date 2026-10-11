"use client";

// Step 5 — Review & Export. Template picker (8 ATS-tested templates) +
// a final review of all sections the user filled in. After "Build it",
// they land on /builder?welcome=1&seed=wizard (handled by the wizard shell).

import { useMemo } from "react";
import { useResumeStore } from "@/stores/resume-store";
import {
  TEMPLATE_CATEGORIES,
  getTemplateName,
  getTemplateDescription,
} from "@/engines/templates/registry";
import { cn } from "@/lib/utils";

export function StepReview() {
  const data = useResumeStore((s) => s.data);
  const template = useResumeStore((s) => s.template);
  const setTemplate = useResumeStore((s) => s.setTemplate);

  const counts = useMemo(
    () => ({
      personal: !!(data.personal.name || data.personal.email),
      experience: data.experience.length,
      education: data.education.length,
      skills: data.skills.reduce((n, g) => n + g.skills.length, 0),
      projects: data.projects.length,
      certs: data.certifications.length,
      langs: data.languages.length,
    }),
    [data],
  );

  return (
    <div className="space-y-5">
      <SummaryCard counts={counts} />

      <div>
        <p className="mb-2 text-sm font-semibold">Choose a template</p>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(TEMPLATE_CATEGORIES).map(([id, tier]) => {
            const selected = template === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTemplate(id)}
                aria-pressed={selected}
                className={cn(
                  "rounded-md border p-3 text-left transition-all duration-150",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "hover:border-primary/40 hover:bg-muted/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{getTemplateName(id)}</span>
                  {tier === "pro" ? (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                      Pro
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Free
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {getTemplateDescription(id)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  counts,
}: {
  counts: {
    personal: boolean;
    experience: number;
    education: number;
    skills: number;
    projects: number;
    certs: number;
    langs: number;
  };
}) {
  const rows: Array<[string, string]> = [
    ["Personal info", counts.personal ? "✓ filled" : "empty"],
    ["Experience entries", `${counts.experience}`],
    ["Education entries", `${counts.education}`],
    ["Skills", `${counts.skills}`],
    ["Projects", `${counts.projects}`],
    ["Certifications", `${counts.certs}`],
    ["Languages", `${counts.langs}`],
  ];
  return (
    <div className="rounded-md border bg-card p-4">
      <p className="mb-2 text-sm font-semibold">What you've added</p>
      <dl className="grid grid-cols-2 gap-y-1 text-xs md:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between border-b border-border/50 py-1 last:border-0">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}